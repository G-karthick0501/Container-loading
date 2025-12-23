import { z } from 'zod';

// ======================
// REUSABLE BUILDING BLOCKS
// ======================

// Positive number with reasonable limits for dimensions (in mm)
const dimension = z
  .number({
    required_error: 'This field is required',
    invalid_type_error: 'Must be a number'
  })
  .positive('Must be greater than 0')
  .max(12000, 'Cannot exceed 12000mm (12 meters)');

// Positive number for weight (in kg)
const weight = z
  .number({
    required_error: 'Weight is required',
    invalid_type_error: 'Weight must be a number'
  })
  .positive('Weight must be greater than 0')
  .max(50000, 'Weight cannot exceed 50,000 kg');

// ======================
// AUTH SCHEMAS
// ======================

export const signupSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required'
    })
    .email('Invalid email format')
    .max(255, 'Email too long'),
  
  password: z
    .string({
      required_error: 'Password is required'
    })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required'
    })
    .email('Invalid email format'),
  
  password: z
    .string({
      required_error: 'Password is required'
    })
    .min(1, 'Password is required')
});

// ======================
// JOB SCHEMAS
// ======================

export const createJobSchema = z.object({
  name: z
    .string({
      required_error: 'Job name is required'
    })
    .min(1, 'Job name cannot be empty')
    .max(100, 'Job name cannot exceed 100 characters')
});

// ======================
// ITEM SCHEMAS
// ======================

export const createItemSchema = z.object({
  name: z
    .string({
      required_error: 'Item name is required'
    })
    .min(1, 'Item name cannot be empty')
    .max(100, 'Item name cannot exceed 100 characters'),
  
  length: dimension,
  width: dimension,
  height: dimension,
  weight: weight,
  
  quantity: z
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number'
    })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity cannot exceed 10,000')
});

// For updating items - all fields optional
export const updateItemSchema = createItemSchema.partial();

// ======================
// CSV ITEM SCHEMA (slightly different - looser for bulk import)
// ======================

export const csvItemSchema = z.object({
  name: z.string().min(1, 'Name required'),
  length: z.coerce.number().positive('Length must be positive'),
  width: z.coerce.number().positive('Width must be positive'),
  height: z.coerce.number().positive('Height must be positive'),
  weight: z.coerce.number().positive('Weight must be positive'),
  quantity: z.coerce.number().int().min(1).default(1)
});