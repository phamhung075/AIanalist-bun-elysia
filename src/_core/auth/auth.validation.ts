import { t } from 'elysia';

export const LoginSchema = t.Object({
  email: t.String({ format: 'email', error: 'Invalid email format', minLength: 1 }),
  password: t.String({ minLength: 1, error: 'Password is required' })
});

export const RegisterSchema = t.Object({
  email: t.String({ format: 'email', error: 'Invalid email format', minLength: 1 }),
  password: t.String({
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).+$',
    error: 'Password must be at least 8 characters and contain lowercase, uppercase, number and special character'
  }),
  firstName: t.String({ minLength: 1, error: 'First name is required' }),
  lastName: t.String({ minLength: 1, error: 'Last name is required' }),
  phone: t.String({ minLength: 10, error: 'Phone number must be at least 10 digits' }),
  address: t.String({ minLength: 1, error: 'Address is required' }),
  postalCode: t.String({ minLength: 1, error: 'Postal code is required' }),
  city: t.String({ minLength: 1, error: 'City is required' }),
  country: t.String({ minLength: 1, error: 'Country is required' })
});