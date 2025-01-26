// contact.repository.ts
import { Service } from 'typedi';
import type { IContact } from './contact.interface';
import { BaseRepository } from '../_core/crud/BaseRepository';

@Service()
class ContactRepository extends BaseRepository<IContact> {
    constructor() {
        super('contacts');
    }
}

export default ContactRepository;
