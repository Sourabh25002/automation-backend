import { z } from 'zod';

export const signUpSchema = z.object({
    email: z.string().email("Please provide a valid email format"),
    userName: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(1, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
    userName: z.string().min(3, "Username must be atleast 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
});