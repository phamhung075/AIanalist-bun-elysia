// contact.validation.ts
import { t } from 'elysia';

export const CreateSchema = t.Object({
  firstName: t.String({ minLength: 1, error: 'First name is required' }),
  lastName: t.String({ minLength: 1, error: 'Last name is required' }),
  email: t.String({ format: 'email', error: 'Invalid email format' }),
  phone: t.String({ minLength: 10, error: 'Phone must be at least 10 digits' }),
  address: t.Optional(t.String()),
  postalCode: t.Optional(t.String()),
  city: t.Optional(t.String()),
  country: t.Optional(t.String()),
  message: t.Optional(t.String())
});

export const UpdateSchema = t.Partial(CreateSchema);

export const IdSchema = t.Object({
  id: t.String({ minLength: 1, error: 'ID is required' })
});


