import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js'
import { signUpSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/auth/signup', validate(signUpSchema), authController.signUp);
router.post('/auth/login', validate(loginSchema), authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);
// router.post('/auth/forget-password', authController.ForgetPassword);

export default router;