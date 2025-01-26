import { firebaseAuth } from "@/_core/middleware/auth.middleware";
import { Elysia } from "elysia";
import { ContactData } from "./contact.interface";
import { contactService } from "./contact.module";
import { CreateSchema, IdSchema, UpdateSchema } from "./contact.validation";

interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
}

export default function contactRouter(app: Elysia) {
  return app
    .post(
      "/",
      { schema: { body: CreateSchema } },
      async ({ body }: { body: ContactData }) => await contactService.create(body)
    )
    .get("/", async ({ query }: { query: QueryParams }) => {
      const { page, limit, sort, order } = query;
      return await contactService.getAll({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort: sort || "createdAt",
        order: order || "desc",
      });
    })
    .get(
      "/:id",
      { beforeHandle: [firebaseAuth], params: IdSchema },
      async ({ params }: { params: typeof IdSchema }) =>
        await contactService.getById(params.id)
    )
    .patch(
      "/:id",
      { beforeHandle: [firebaseAuth], params: IdSchema, body: UpdateSchema },
      async ({ params, body }: { params: typeof IdSchema; body: ContactData }) =>
        await contactService.update(params.id, body)
    )
    .delete(
      "/:id",
      { beforeHandle: [firebaseAuth], params: IdSchema },
      async ({ params }: { params: typeof IdSchema }) =>
        await contactService.delete(params.id)
    );
}
