import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ---- Créer un utilisateur ----
export class CreateUserDto {
  @ApiProperty({ example: 'heifa@example.com', description: 'Email unique' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example: 'Heifa2024!',
    description: 'Mot de passe (min 8 chars)',
  })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit avoir au moins 8 caractères' })
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'heifa_dev', description: "Nom d'utilisateur" })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;
}

// ---- Réponse publique (sans mot de passe) ----
export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() username: string;
  @ApiProperty() role: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
}
