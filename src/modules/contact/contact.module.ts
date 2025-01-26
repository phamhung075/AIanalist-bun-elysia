// src/modules/contact/contact.module.ts
import { Container } from 'typedi';
import ContactRepository from './contact.repository';
import ContactService from './contact.service';


class ContactModule {
    private static instance: ContactModule;
    public contactService: ContactService;
    public contactRepository: ContactRepository;

    private constructor() {
        // First create repository
        this.contactRepository = new ContactRepository();
        Container.set('ContactRepository', this.contactRepository);

        // Then create service with repository
        this.contactService = new ContactService(this.contactRepository);
        Container.set('ContactService', this.contactService);
    }

    public static getInstance(): ContactModule {
        if (!ContactModule.instance) {
            ContactModule.instance = new ContactModule();
        }
        return ContactModule.instance;
    }
}

const contactModule = ContactModule.getInstance();
export const { contactService, contactRepository } = contactModule;