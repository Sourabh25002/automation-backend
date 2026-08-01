import { config } from '../utils/config.js';

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: message,
        errors: err.errors || [],

        stack: config.NODE_ENV === "development" ? err.stack : undefined
    });
};
