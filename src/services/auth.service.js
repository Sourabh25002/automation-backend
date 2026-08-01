import pool from '../database/postgreSqlConnection.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';
import { ApiError } from '../utils/apiError.js';

const generateAccessAndRefreshTokens = async (userId) => {
    const accessToken = jwt.sign(
        { userId },
        config.ACCESS_TOKEN_SECRET,
        { expiresIn: config.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
        throw new ApiError(500, "Error while creating user");
    }
};

export const loginUser = async (loginData) => {
    const { userName, password } = loginData;

    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await pool.query(query, [userName]);

    if (result.rows.length === 0) {
        throw new ApiError(401, "Invalid username or password");
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid username or password");
    }

    delete user.password;

    const tokens = await generateAccessAndRefreshTokens(user.id);

    return {
        user,
        ...tokens
    };

};