import { describe, beforeEach, it, expect, vi } from 'vitest';
import { LoginUserUseCase } from './LoginUserUseCase';
import { 
  InvalidCredentialsException,
  MissingIdentifierException,
  MissingPasswordException,
  InvalidEmailFormatException 
} from '@nx-starter/domain-core';
import { IUserRepository, User } from '@nx-starter/domain-core';
import { IPasswordHashingService } from '../../services/PasswordHashingService';
import { IJwtTokenService } from '../../services/JwtTokenService';
import { LoginUserCommand } from '../../dto/UserCommands';

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
  let mockUserRepository: IUserRepository;
  let mockPasswordHashingService: IPasswordHashingService;
  let mockJwtTokenService: IJwtTokenService;
  let mockUser: User;

  beforeEach(() => {
    mockUserRepository = {
      getById: vi.fn(),
      getByEmail: vi.fn(),
      getByUsername: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsByEmail: vi.fn(),
      existsByUsername: vi.fn(),
      generateUniqueUsername: vi.fn(),
    };

    mockPasswordHashingService = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    mockJwtTokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
    };

    loginUserUseCase = new LoginUserUseCase(
      mockUserRepository,
      mockPasswordHashingService,
      mockJwtTokenService
    );

    // Create a mock user
    mockUser = User.create(
      'user-id-123',
      'John',
      'Doe',
      'john.doe@example.com',
      'johndoe',
      'hashed-password'
    );
  });

  describe('validation', () => {
    it('should throw MissingIdentifierException when neither email nor username is provided', async () => {
      const command: LoginUserCommand = {
        password: 'password123',
      };

      await expect(loginUserUseCase.execute(command)).rejects.toThrow(
        MissingIdentifierException
      );
    });

    it('should throw MissingPasswordException when password is not provided', async () => {
      const command: LoginUserCommand = {
        email: 'john.doe@example.com',
        password: '',
      };

      await expect(loginUserUseCase.execute(command)).rejects.toThrow(
        MissingPasswordException
      );
    });

    it('should throw InvalidEmailFormatException when email format is invalid', async () => {
      const command: LoginUserCommand = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(loginUserUseCase.execute(command)).rejects.toThrow(
        InvalidEmailFormatException
      );
    });
  });

  describe('authentication with email', () => {
    it('should successfully authenticate user with valid email and password', async () => {
      const command: LoginUserCommand = {
        email: 'john.doe@example.com',
        password: 'password123',
      };

      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHashingService.compare).mockResolvedValue(true);
      vi.mocked(mockJwtTokenService.generateToken).mockReturnValue('jwt-token-123');

      const result = await loginUserUseCase.execute(command);

      expect(result.token).toBe('jwt-token-123');
      expect(result.user).toBe(mockUser);
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(mockPasswordHashingService.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockJwtTokenService.generateToken).toHaveBeenCalledWith({
        userId: 'user-id-123',
        email: 'john.doe@example.com',
        username: 'johndoe',
        role: 'user',
      });
    });

    it('should throw InvalidCredentialsException when user does not exist', async () => {
      const command: LoginUserCommand = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(undefined);

      await expect(loginUserUseCase.execute(command)).rejects.toThrow(
        InvalidCredentialsException
      );
    });

    it('should throw InvalidCredentialsException when password is incorrect', async () => {
      const command: LoginUserCommand = {
        email: 'john.doe@example.com',
        password: 'wrong-password',
      };

      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHashingService.compare).mockResolvedValue(false);

      await expect(loginUserUseCase.execute(command)).rejects.toThrow(
        InvalidCredentialsException
      );
    });
  });

  describe('authentication with username', () => {
    it('should successfully authenticate user with valid username and password', async () => {
      const command: LoginUserCommand = {
        username: 'johndoe',
        password: 'password123',
      };

      vi.mocked(mockUserRepository.getByUsername).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHashingService.compare).mockResolvedValue(true);
      vi.mocked(mockJwtTokenService.generateToken).mockReturnValue('jwt-token-123');

      const result = await loginUserUseCase.execute(command);

      expect(result.token).toBe('jwt-token-123');
      expect(result.user).toBe(mockUser);
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('johndoe');
    });

    it('should throw InvalidCredentialsException when username does not exist', async () => {
      const command: LoginUserCommand = {
        username: 'nonexistentuser',
        password: 'password123',
      };

      vi.mocked(mockUserRepository.getByUsername).mockResolvedValue(undefined);

      await expect(loginUserUseCase.execute(command)).rejects.toThrow(
        InvalidCredentialsException
      );
    });
  });
});