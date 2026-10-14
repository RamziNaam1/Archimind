import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'new-email@example.com', required: false })
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    minLength: 8,
    required: false,
    description: 'Nouveau mot de passe optionnel',
  })
  @IsString()
  @IsOptional()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Le mot de passe est trop faible',
  })
  password?: string;
}
