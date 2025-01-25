import { Elysia } from "elysia";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { firebaseAuth } from "@/_core/middleware/auth.middleware";
import _SUCCESS from "@/_core/helper/http-status/success";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadRoute = async (path: string) => {
  const module = await import(path);
  return module.default;
};

export default async function router(app: Elysia) {
  app.get("/", ({ set }) => {
    const response = new _SUCCESS.OkSuccess({
      message: "Welcome to AIAnalyst!",
    });
    set.status = response.status;
    if (response.options.headers) {
      Object.entries(response.options.headers).forEach(([key, value]) => {
        set.headers[key] = value as string;
      });
    }
    return response.getBody();
  });

  app.get("/health", ({ set }) => {
    const response = new _SUCCESS.OkSuccess({ message: "ok" });
    set.status = response.status;
    return response.getBody();
  });

  // Uncomment these once routes are ready
  // await app.group('/api/auth', app => app.use(await loadRoute(resolve(__dirname, '../_core/auth/index.ts'))));

  // await app.group('/api/contact', app =>
  //   app.use(firebaseAuth)
  //      .use(await loadRoute(resolve(__dirname, './contact/index.ts')))
  // );

  // await app.group('/api/ai', app =>
  //   app.use(firebaseAuth)
  //      .use(await loadRoute(resolve(__dirname, './ai/index.ts')))
  // );
}
