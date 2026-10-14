import {
  Controller,
  Post,
  Get,
  Body,
  Patch,        // ← ADD THIS
  Delete, 
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UmlService } from './uml.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import * as jwtPayload from '@modules/auth/interfaces/jwt-payload.interface';
import { GenerateUmlDto } from './dto/generate-uml.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ExportService } from './export.service';

@ApiTags('UML')
@ApiBearerAuth()
@Controller('uml')
@UseGuards(JwtAuthGuard)
export class UmlController {
  constructor(
    private readonly umlService: UmlService,
    private readonly exportService: ExportService,
  ) {}

  @Get(':id/export/:format')
  @ApiOperation({
    summary: 'Exporter un diagramme (png, svg, pdf)',
    description: 'Envoie le code Mermaid à Kroki pour générer un fichier exportable.',
  })
  async export(
    @CurrentUser() user: any, // Remplacé par any pour lire dynamiquement les deux propriétés
    @Param('id') id: string,
    @Param('format') format: string,
  ) {
    const userId = user.userId || user.id || user.sub; // 🔑 Sécurisation de l'ID
    const diagram = await this.umlService.getDiagramById(id, userId);
    const url = await this.exportService.getExportUrl(
      diagram.generatedCode || '',
      format,
    );
    return { url };
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Générer du code Mermaid à partir de texte',
    description: "Utilise l'IA (Gemini) pour transformer une description textuelle en diagramme UML valide.",
  })
  async generate(@CurrentUser() user: any, @Body() dto: GenerateUmlDto) {
  console.log("REQUÊTE REÇUE DANS UML CONTROLLER", dto); // AJOUTE CECI
  const userId = user.userId || user.id || user.sub;
  return this.umlService.generateDiagram(userId, dto);
}

  @Get('my-diagrams')
  @ApiOperation({ summary: 'Lister mes diagrammes' })
  async list(@CurrentUser() user: any) {
    const userId = user.userId || user.id || user.sub; // 🔑 Sécurisation de l'ID
    return this.umlService.getUserDiagrams(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Voir le détail d'un diagramme" })
  async get(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const userId = user.userId || user.id || user.sub; // 🔑 Sécurisation de l'ID
    return this.umlService.getDiagramById(id, userId);
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/diagrams',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `uml-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|svg\+xml)$/)) {
          return callback(new BadRequestException('Seuls les fichiers JPG, PNG et SVG sont acceptés'), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  async uploadImage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image non fournie');
    }

    const userId = user.userId || user.id || user.sub; // 🔑 Sécurisation de l'ID
    const imageUrl = `/uploads/diagrams/${file.filename}`;
    return this.umlService.updateDiagramImage(id, userId, imageUrl);
  }
   @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un diagramme' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const userId = user.userId || user.id || user.sub;
    return this.umlService.updateDiagram(id, userId, updateData);
  }
 
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un diagramme' })
  async delete(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const userId = user.userId || user.id || user.sub;
    await this.umlService.deleteDiagram(id, userId);
    return { message: 'Diagram deleted successfully' };
  }
}