import type { Context } from 'elysia';

export class UserController {
 static async getAll(context: Context) {
   return { users: [] };
 }

 static async getById({ params: { id } }: Context) {
   return { id };
 }

 static async create({ body }: Context) {
   return { created: true, data: body };
 }

 static async update({ params: { id }, body }: Context) {
   return { updated: true, id, data: body };
 }

 static async delete({ params: { id } }: Context) {
   return { deleted: true, id };
 }
}