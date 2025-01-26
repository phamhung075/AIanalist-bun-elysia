// src/_core/auth/services/auth.service.ts

import ContactService from "@/modules/contact/contact.service";
import { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import { UserCredential } from "firebase/auth";
import _ERROR from "../helper/http-status/error";
import { AuthTokens, IAuth, IRegister } from "./auth.interface";
import AuthRepository from "./auth.repository";
import { Service } from "typedi";

@Service()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly contactService: ContactService
  ) {}

  async register(registerData: IRegister): Promise<UserCredential> {
    const { email, password, ...contactData } = registerData;

    const userCred = await this.authRepository.createUser({ email, password });

    await this.contactService.createWithId(userCred.user.uid, {
      ...contactData,
      email,
    });

    return userCred;
  }

  async login(body: IAuth): Promise<AuthTokens> {
    console.log(`🔄 Connexion de l'utilisateur : ${body.email}`);

    // Appeler le dépôt pour effectuer la connexion
    const { idToken, refreshToken } = await this.authRepository.loginUser(body.email, body.password);
    // console.log(`✅ Connexion réussie avec l'utilisateur : ${body.email}`);
    // console.log(`🔄 Token ID : ${idToken}`);
    // console.log(`🔄 Token Refresh : ${refreshToken}`);
    return { idToken, refreshToken };
  }

  async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      const decodedToken = await this.authRepository.verifyIdToken(token);
      console.log(`✅ Token verified successfully: ${decodedToken.uid}`);
      return decodedToken;
    } catch (error) {
      throw new _ERROR.UnauthorizedError({
        message: "Invalid or expired token",
      });
    }
  }

  async getUser(uid: string): Promise<UserRecord> {
    try {
      console.log(`Fetching user details for UID: ${uid}`);
      const userRecord = await this.authRepository.getUserById(uid);
      console.log(`✅ User details fetched successfully: ${userRecord.email}`);
      return userRecord;
    } catch (error) {
      throw new _ERROR.UnauthorizedError({
        message: "Failed to fetch user details",
      });
    }
  }

  async refreshToken(
    token: string
  ): Promise<{ idToken: string; refreshToken: string }> {
    console.log(`Refreshing token: ${token}`);
    try {
      const decodedToken = await this.authRepository.refreshToken(token);
      return decodedToken;
    } catch (error) {
      throw new _ERROR.UnauthorizedError({
        message: "Invalid or expired token",
      });
    }
  }
}

export default AuthService;
