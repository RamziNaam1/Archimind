import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      "L'adresse e-mail de l'utilisateur utilisée pour l'inscription",
  })
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: "Le mot de passe de l'utilisateur (Min 8 caractères)",
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
