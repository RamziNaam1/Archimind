import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createData: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(
      createData.email,
    );
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    const hashedPassword = await bcrypt.hash(createData.password, 10);

    const user = await this.userRepository.create({
      email: createData.email,
      firstName: createData.firstName,
      lastName: createData.lastName,
      passwordHash: hashedPassword,
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async update(id: string, data: any) {
    const updateData = { ...data };

    if (updateData.password) {
      updateData.passwordHash = await this.hashPassword(updateData.password);
      delete updateData.password;
    }

    return this.userRepository.update(id, updateData);
  }

  async upgradeAccount(id: string) {
    return this.userRepository.update(id, { role: 'ADMIN' });
  }

  async deleteAccount(id: string) {
    return this.userRepository.delete(id);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("L'ancien mot de passe est incorrect");
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);
    return this.userRepository.update(userId, { passwordHash: hashedPassword });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
