import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { config } from "../utils/config.js";
import pool from "../database/postgreSqlConnection.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request. No token provided.");
    }

    try {
        const decodedToken = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

        const query = `SELECT id, email, username, full_name FROM users WHERE id = $1`;
        const result = await pool.query(query, [decodedToken.userId]);

        if (result.rows.length === 0) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = result.rows[0];

        next();

    } catch (error) {

        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});
