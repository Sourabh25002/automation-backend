import * as userService from '../services/user.service.js';

export const sayHello = (req, res) => {
    const message = userService.getHelloMessage();

    res.status(200).json({
        success: true,
        message: message
    });
}