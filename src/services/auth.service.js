import pool from '../database/postgreSqlConnection.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';
import { ApiError } from '../utils/apiError.js';

const hashRefreshToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

const createRefreshToken = () => {
    const refreshToken = crypto.randomBytes(40).toString('hex');

    return {
        refreshToken,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_EXPIRY_MS)
    };
};

const createAccessToken = (userId) => jwt.sign(
    { userId },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY }
);

const generateAccessAndRefreshTokens = async (userId) => {
    const accessToken = createAccessToken(userId);
    const { refreshToken, tokenHash, expiresAt } = createRefreshToken();

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
    );

    return { accessToken, refreshToken };
};

export const createUser = async (userData) => {
    const { email, userName, fullName, password } = userData;

    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);

    try {
        const query = `INSERT INTO users (email, username, full_name, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, username, full_name;`;

        const values = [email, userName, fullName, hashedPassword];
        const result = await pool.query(query, values);

        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') {
            if (error.constraint === 'users_email_key') {
                throw new ApiError(409, "Email already exists!");
            }
            if (error.constraint === 'users_username_key') {
                throw new ApiError(409, "This username is already taken!");
            }

            throw new ApiError(409, "User already exists!");
        }
        console.error("DATABASE ERROR:", error);

        throw new ApiError(500, "Error while creating user");
    }
};

export const loginUser = async (loginData) => {
    const { userName, password } = loginData;

    const query = `SELECT id, email, username, full_name, password
                   FROM users WHERE username = $1`;
    const result = await pool.query(query, [userName]);

    if (result.rows.length === 0) {
        throw new ApiError(401, "Invalid username or password");
    }

    const record = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, record.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid username or password");
    }

    const user = {
        id: record.id,
        email: record.email,
        username: record.username,
        full_name: record.full_name
    };

    const tokens = await generateAccessAndRefreshTokens(user.id);

    return { user, ...tokens };
};

export const refreshUser = async (refreshToken) => {
    if (typeof refreshToken !== 'string' || !refreshToken) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const oldTokenHash = hashRefreshToken(refreshToken);
    const nextToken = createRefreshToken();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Replacing the hash is atomic: the old token stops working after this transaction.
        const result = await client.query(
            `UPDATE refresh_tokens
             SET token_hash = $1, expires_at = $2
             WHERE token_hash = $3 AND expires_at > NOW()
             RETURNING user_id`,
            [nextToken.tokenHash, nextToken.expiresAt, oldTokenHash]
        );

        if (result.rowCount !== 1) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const userResult = await client.query(
            `SELECT id, email, username, full_name FROM users WHERE id = $1`,
            [result.rows[0].user_id]
        );

        if (userResult.rows.length !== 1) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const user = userResult.rows[0];
        const accessToken = createAccessToken(user.id);

        await client.query('COMMIT');

        return {
            user,
            accessToken,
            refreshToken: nextToken.refreshToken
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const logoutUser = async (refreshToken) => {
    if (typeof refreshToken !== 'string' || !refreshToken) {
        return;
    }

    await pool.query(
        `DELETE FROM refresh_tokens WHERE token_hash = $1`,
        [hashRefreshToken(refreshToken)]
    );
};
