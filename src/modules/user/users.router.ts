import { Elysia } from 'elysia'
import { UserController } from './users.controller'

export const users = new Elysia({ prefix: '/users' })
  .get('/', UserController.getAll)
  .get('/:id', UserController.getById)
  .post('/', UserController.create)
  .put('/:id', UserController.update)
  .delete('/:id', UserController.delete)