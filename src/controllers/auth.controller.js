import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../utils/config.js';
import * as authService from '../services/auth.service.js';

const refreshCookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/"
};

const setRefreshCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        ...refreshCookieOptions,
        maxAge: config.REFRESH_TOKEN_EXPIRY_MS
    });
};

export const signUp = asyncHandler(async (req, res) => {
    const newUser = await authService.createUser(req.body);

    return res.status(201).json(
        new ApiResponse(201, newUser, "User registered successfully!")
    );
});

export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

    setRefreshCookie(res, refreshToken);

    return res.status(200).json(
        new ApiResponse(200, { user, accessToken }, "Login successful!")
    );
});

export const refresh = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.refreshUser(
        req.cookies?.refreshToken
    );

    setRefreshCookie(res, refreshToken);

    return res.status(200).json(
        new ApiResponse(200, { user, accessToken }, "Token refreshed successfully!")
    );
});

export const logout = asyncHandler(async (req, res) => {
    await authService.logoutUser(req.cookies?.refreshToken);

    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json(
        new ApiResponse(200, null, "Logout successful!")
    );
});
