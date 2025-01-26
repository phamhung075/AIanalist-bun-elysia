// contact.service.ts

import { Service } from 'typedi';
import type { IContact } from "./contact.interface";
import type ContactRepository from "./contact.repository";
import { BaseService } from '../_core/crud/BaseService';


@Service()
class ContactService extends BaseService<IContact> {
    constructor(
        protected readonly repository: ContactRepository
    ) {
        super(repository);
    }
}

export default ContactService;