import * as userService from '../services/user.service.js';

export const Login = (req, res) => {
    const message = userService.Login();

    res.status(200).json({
        success: true,
        message: message
    });
}