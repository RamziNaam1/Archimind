import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import * as jwtPayload from '@modules/auth/interfaces/jwt-payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer mon profil' })
  async getProfile(@CurrentUser() userPayload: jwtPayload.JwtPayload) {
    const user = await this.usersService.findById(userPayload.sub);
    if (user) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Modifier mon profil' })
  async updateProfile(
    @CurrentUser() userPayload: jwtPayload.JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(userPayload.sub, updateUserDto);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Changer mon mot de passe' })
  async changePassword(
    @CurrentUser() userPayload: jwtPayload.JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(userPayload.sub, changePasswordDto);
    return { message: 'Mot de passe mis à jour avec succès' };
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer mon compte définitivement' })
  async deleteProfile(@CurrentUser() userPayload: jwtPayload.JwtPayload) {
    await this.usersService.deleteAccount(userPayload.sub);
    return { message: 'Compte supprimé avec succès' };
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à niveau mon compte (Passer ADMIN)' })
  async upgrade(@CurrentUser() userPayload: jwtPayload.JwtPayload) {
    const user = await this.usersService.upgradeAccount(userPayload.sub);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException(
              'Seuls les fichiers JPG, JPEG et PNG sont acceptés',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Télécharger une photo de profil' })
  async uploadAvatar(
    @CurrentUser() userPayload: jwtPayload.JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Fichier non fourni');
    }

    const avatarUrl = `/uploads/${file.filename}`;
    const user = await this.usersService.update(userPayload.sub, { avatarUrl });
    const { passwordHash, ...result } = user;
    return result;
  }
}
