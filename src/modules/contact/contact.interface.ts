// contact.interface.ts


export interface ContactId {
  id: string;
}
export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  message?: string;
}

export interface IContact extends ContactId, ContactData {
  createdAt?: Date;
  updatedAt?: Date;
}

