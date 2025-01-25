import { Elysia } from 'elysia'
import { users } from './user/users.router'

export const router = new Elysia({ prefix: '/api/v1' })
  .use(users)
