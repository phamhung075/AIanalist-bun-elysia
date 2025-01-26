import { cookie } from '@elysiajs/cookie';
import { Cookie, Elysia } from "elysia";
import _SUCCESS, { SuccessResponse } from "../helper/http-status/success";
import { IRegister } from "./auth.interface";
import { authService } from "./auth.module";
import { LoginSchema, RegisterSchema } from "./auth.validation";
import { API_CONFIG } from '../config/api-config';
import { firebaseAuth } from '../middleware/auth.middleware';
import _ERROR from '../helper/http-status/error';
import { DecodedIdToken } from 'firebase-admin/auth';

export default async function authRouter() {
  const route = new Elysia({ prefix: API_CONFIG.PREFIX+"/auth" })
    .use(cookie());

  return route
    .post(
      "/register",
      async ({ body }: { body: IRegister }): Promise<SuccessResponse> => {
        await authService.register(body);
        return new _SUCCESS.OkSuccess({ message: "Registered successfully, please check your email for verification" }).getBody();
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
    .post(
      "/logout",
      { beforeHandle: [firebaseAuth] },
      async ({ user, cookie, set }: { user: DecodedIdToken; cookie: Record<string, Cookie<string | undefined>>; set: any }) => {
        if (!user) {
          set.status = 401;
          return new _ERROR.UnauthorizedError({ message: "Non autorisé" });
        }
    
        await authService.logoutUser(user);
        
        if (cookie.idToken) {
          cookie.idToken.value = "";
        }
        
        if (cookie.refreshToken) {
          cookie.refreshToken.value = "";
        }
        
        return new _SUCCESS.OkSuccess({ message: "Déconnexion réussie" }).getBody();
      }
    )
    .listen(3000);
}