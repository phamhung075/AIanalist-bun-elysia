import { cookie } from '@elysiajs/cookie';
import { Elysia } from "elysia";
import _SUCCESS, { SuccessResponse } from "../helper/http-status/success";
import { IRegister } from "./auth.interface";
import { authService } from "./auth.module";
import { LoginSchema, RegisterSchema } from "./auth.validation";

export default async function authRouter() {
  const route = new Elysia({ prefix: "/auth" })
    .use(cookie());

  return route
    .post(
      "/register",
      async ({ body }): Promise<SuccessResponse> => {
        const result = await authService.register(body);
        return new _SUCCESS.OkSuccess({ data: result }).getBody();
      },
      { body: RegisterSchema }
    )
    .post(
      "/login",
      async ({ cookie, body }) => {
        try {
          const { idToken, refreshToken } = await authService.login(body);
          if (idToken && refreshToken) {
            cookie.idToken.set({
              value: idToken,
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
              path: '/'
            });
            
            cookie.refreshToken.set({
              value: refreshToken,
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
              path: '/'
            });
          }
          return (new _SUCCESS.OkSuccess({ message: "Connexion réussie" })).getBody();
        } catch (error) {
          console.error("❌ Connexion échouée:", error);
          return { success: false };
        }
      },
      { body: LoginSchema }
    )
    .listen(3000);
}