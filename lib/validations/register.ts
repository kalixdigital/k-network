import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name is required"),

    phone: z
      .string()
      .min(11, "Phone number must be at least 11 digits"),

    email: z.string().email("Invalid email address"),

    referral: z.string().optional(),

    country: z.string(),

    state: z.string().min(1, "Please select your state"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),

    agree: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms & Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
