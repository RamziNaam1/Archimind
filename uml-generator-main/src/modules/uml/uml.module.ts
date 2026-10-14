import { Module } from '@nestjs/common';
import { UmlService } from './uml.service';
import { UmlController } from './uml.controller';
import { UmlRepository } from './repositories/uml.repository';
import { ClassDiagramGenerator } from './strategies/class-diagram.generator';
import { UseCaseGenerator } from './strategies/use-case.generator';
import { SequenceDiagramGenerator } from './strategies/sequence-diagram.generator';
import { ActivityDiagramGenerator } from './strategies/activity-diagram.generator';
import { ErDiagramGenerator } from './strategies/er-diagram.generator';
import { AiDiagramGenerator } from './strategies/ai-diagram.generator';
import { MermaidValidatorService } from './mermaid-validator.service';
import { AiService } from '../../infrastructure/ai/ai.service';
import { ExportService } from './export.service';

@Module({
  controllers: [UmlController],
  providers: [
    UmlService,
    UmlRepository,
    ExportService,
    MermaidValidatorService,
    AiDiagramGenerator,
    AiService, // <--- AJOUTE ÇA ICI
    ClassDiagramGenerator,
    UseCaseGenerator,
    SequenceDiagramGenerator,
    ActivityDiagramGenerator,
    ErDiagramGenerator,
  ],
  exports: [UmlService, ExportService],
})
export class UmlModule {}

