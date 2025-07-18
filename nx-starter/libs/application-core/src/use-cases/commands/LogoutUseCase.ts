import { injectable, inject } from 'tsyringe';
import { 
  IRefreshTokenRepository,
  InvalidTokenException
} from '@nx-starter/shared-domain';
import type { LogoutCommand } from '../../dto/AuthCommands';
import { TOKENS } from '../../di/tokens';

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(TOKENS.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    // Find refresh token
    const refreshToken = await this.refreshTokenRepository.getByToken(command.refreshToken);
    if (!refreshToken) {
      throw new InvalidTokenException('Refresh token not found');
    }

    // Revoke the refresh token
    await this.refreshTokenRepository.revoke(command.refreshToken);
  }
}