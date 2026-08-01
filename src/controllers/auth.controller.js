import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../utils/config.js';
import * as authService from '../services/auth.service.js';


export const signUp = asyncHandler(async (req, res) => {
    const newUser = await authService.createUser(req.body);

    return res.status(201).json(
        new ApiResponse(201, newUser, "User registered successfully!")
    );
});

export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days in milliseconds
    });

    return res.status(200).json(
        new ApiResponse(200, { user, accessToken }, "Login successful!")
    );
});
