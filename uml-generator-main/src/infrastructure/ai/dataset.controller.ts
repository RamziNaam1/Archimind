import { Controller, Post, Body, Get, UseGuards, Res } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import type { DatasetEntry } from './dataset.service';
import { AiService } from './ai.service';
import { MermaidValidatorService } from '../../modules/uml/mermaid-validator.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Response } from 'express';

@ApiTags('AI-Dataset')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('ai/dataset')
export class DatasetController {
  constructor(
    private readonly datasetService: DatasetService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer les exemples du dataset' })
  getDataset() {
    return this.datasetService.getExamples();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir des statistiques sur le dataset' })
  getStats() {
    return this.datasetService.getStats();
  }

  @Get('validate')
  @ApiOperation({ summary: 'Valider toutes les entrées du dataset' })
  validate() {
    return this.datasetService.validateAll();
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter une entrée au dataset' })
  async addEntry(@Body() entry: DatasetEntry) {
    await this.datasetService.addEntry(entry);
    return { message: 'Entrée ajoutée avec succès' };
  }

  @Post('reload')
  @ApiOperation({ summary: 'Recharger le dataset depuis le fichier' })
  async reload() {
    await this.datasetService.loadDataset();
    return { message: 'Dataset rechargé' };
  }

  @Post('harvest')
  @ApiOperation({ summary: 'Importer les diagrammes réussis de la base de données' })
  async harvest() {
    return await this.datasetService.harvestFromDatabase();
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Évaluer la qualité de génération actuelle de l\'IA' })
  async evaluate() {
    const validator = new MermaidValidatorService();
    return await this.datasetService.evaluate(
      (prompt, type) => this.aiService.generateDiagramCode(prompt, type),
      (code, type) => validator.validate(code, type),
    );
  }

  @Get('export-llama3')
  @ApiOperation({
    summary: 'Exporter le dataset complet au format Llama 3 JSONL',
  })
  @ApiResponse({
    status: 200,
    description: 'Fichier JSONL exporté avec succès.',
  })
  async exportLlama3(@Res() res: Response) {
    const jsonlContent = await this.datasetService.exportToLlama3Jsonl();

    res.setHeader('Content-Type', 'application/x-jsonlines');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="llama3_uml_dataset.jsonl"',
    );
    return res.send(jsonlContent);
  }
}
