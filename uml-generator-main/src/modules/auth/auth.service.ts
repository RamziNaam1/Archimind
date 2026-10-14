import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import * as crypto from 'crypto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly auditService: AuditService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // On renvoie explicitement les champs attendus par ton frontend
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      await this.auditService.log('SYSTEM', 'LOGIN_FAILED', 'User', undefined, {
        email: loginDto.email,
        reason: 'User not found',
      });
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      await this.auditService.log(user.id, 'LOGIN_FAILED', 'User', user.id, {
        reason: 'Invalid password',
      });
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.isActive) {
      await this.auditService.log(user.id, 'LOGIN_FAILED', 'User', user.id, {
        reason: 'Account deactivated',
      });
      throw new UnauthorizedException(
        'Votre compte est désactivé. Veuillez contacter le support.',
      );
    }

    await this.auditService.log(user.id, 'LOGIN_SUCCESS', 'User', user.id);
    return this.generateTokens(user.id, user.email, user.role);
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepo.findByToken(refreshToken);
    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    const user = await this.usersService.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Révoquer l'ancien token (rotation des tokens pour la sécurité)
    await this.refreshTokenRepo.revoke(refreshToken);

    // Générer de nouveaux tokens
    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepo.revoke(refreshToken);
    return { message: 'Déconnexion réussie' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    // Générer un refresh token aléatoire fort
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

    await this.refreshTokenRepo.create(userId, refreshToken, expiresAt);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
