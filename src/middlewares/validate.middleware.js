import { ApiError } from '../utils/apiError.js';
import { ZodError } from 'zod';

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Check the body against the Zod schema
            schema.parse(req.body);

            // If it passes, move to the controller!
            next();

        } catch (error) {
            if (!(error instanceof ZodError)) {
                return next(error);
            }

            // If it fails, extract the clean messages from Zod
            const errorMessages = error.issues.map((issue) => issue.message);

            // Throw our custom ApiError with the array of messages
            const apiError = new ApiError(400, "Validation Failed", errorMessages);

            // Send it to the Global Error Handler
            next(apiError);
        }
    };
};
