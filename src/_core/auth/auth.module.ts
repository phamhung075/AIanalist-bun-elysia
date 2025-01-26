import AuthRepository from './auth.repository';
import AuthService from './auth.service';
import { contactService } from '@/modules/contact/contact.module';
import { Container } from 'typedi';

class AuthModule {
    private static instance: AuthModule;

    public authRepository: AuthRepository;
    public authService: AuthService;

    private constructor() {
        // Initialize repository
        this.authRepository = new AuthRepository();
        Container.set('AuthRepository', this.authRepository);

        // Initialize service with dependencies
        this.authService = new AuthService(this.authRepository, contactService);
        Container.set('AuthService', this.authService);
    }

    public static getInstance(): AuthModule {
        if (!AuthModule.instance) {
            AuthModule.instance = new AuthModule();
        }
        return AuthModule.instance;
    }
}

const authModule = AuthModule.getInstance();

export const { authService, authRepository } = authModule;