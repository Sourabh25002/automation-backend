import { ApiError } from '../utils/apiError.js';

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Check the body against the Zod schema
            schema.parse(req.body);

            // If it passes, move to the controller!
            next();

        } catch (error) {
            // If it fails, extract the clean messages from Zod
            const errorMessages = error.errors.map((err) => err.message);

            // Throw our custom ApiError with the array of messages
            const apiError = new ApiError(400, "Validation Failed", errorMessages);

            // Send it to the Global Error Handler
            next(apiError);
        }
    };
};
