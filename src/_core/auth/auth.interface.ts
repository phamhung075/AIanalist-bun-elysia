// contact.interface.ts
export interface IAuth {
  email: string;
  password: string;
}

export interface IRegister extends IAuth {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface AuthTokens {
  idToken: string;
  refreshToken: string;
  user?: {
    id: string
    email: string
  }
}
