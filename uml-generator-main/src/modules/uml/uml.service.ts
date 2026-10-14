import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UmlRepository } from './repositories/uml.repository';
import { GenerateUmlDto } from './dto/generate-uml.dto';
import { DiagramType, DiagramStatus } from '@prisma/client';
import { AiService } from '../../infrastructure/ai/ai.service';
import { MermaidValidatorService } from './mermaid-validator.service';

@Injectable()
export class UmlService {
  private readonly logger = new Logger(UmlService.name);

  constructor(
    private readonly umlRepository: UmlRepository,
    private readonly aiService: AiService,
    private readonly validator: MermaidValidatorService,
  ) {}

  // Méthode pour générer ou mettre à jour un diagramme
  // ... (dans ton UmlService)

async generateDiagram(userId: string, dto: GenerateUmlDto) {
  const type = dto.type || DiagramType.USE_CASE;

  // ❌ REMOVE all this context-fetching logic - frontend already handles it!
  // const userDiagrams = await this.umlRepository.findByUserId(userId);
  // const lastDiagram = userDiagrams?.length > 0 ? userDiagrams[userDiagrams.length - 1] : null;
  // let context: string | undefined = undefined;
  // if (lastDiagram?.generatedCode && !lastDiagram.generatedCode.includes("Workspace")) {
  //   context = lastDiagram.generatedCode;
  // }

  let generatedCode: string;
  try {
    // ✅ JUST pass dto.text (which already contains context from frontend)
    generatedCode = await this.aiService.generateDiagramCode(dto.text, type);
    
    generatedCode = generatedCode
      .replace(/class\s+Workspace\s*\{[^}]*\}/g, '')
      .replace(/class\s+Structure\s*\{[^}]*\}/g, '')
      .replace(/Workspace\s*--\*\s*Structure.*/g, '')
      .replace(/.*--\*\s*Workspace.*/g, '');

    generatedCode = this.validator.cleanup(generatedCode);
  } catch (err) {
    this.logger.error(`Erreur AI: ${err}`);
    generatedCode = "classDiagram\n    %% Erreur";
  }

  return this.umlRepository.create({
    name: dto.name ?? "Untitled Diagram",
    type: type as DiagramType,
    inputDescription: dto.text,
    generatedCode,
    status: DiagramStatus.SUCCESS,
    user: { connect: { id: userId } },
  } as any);
}

  // Méthode pour récupérer tous les diagrammes d'un utilisateur
  async getUserDiagrams(userId: string) {
    return this.umlRepository.findByUserId(userId);
  }

  // Méthode pour récupérer un diagramme spécifique
  async getDiagramById(id: string, userId: string) {
    const diagram = await this.umlRepository.findById(id);
    if (!diagram || diagram.userId !== userId) {
      throw new NotFoundException('Diagramme non trouvé ou accès refusé'); // <--- C'est ici !
    }
    return diagram;
}

  // Méthode pour mettre à jour l'image associée au diagramme
  async updateDiagramImage(id: string, userId: string, renderedUrl: string) {
    // Vérifier d'abord si le diagramme appartient bien à l'utilisateur
    await this.getDiagramById(id, userId);
    return this.umlRepository.update(id, { renderedUrl } as any);
  }

  // Suppression
  async deleteDiagram(id: string, userId: string) {
    await this.getDiagramById(id, userId);
    return this.umlRepository.delete(id);
  }
  async updateDiagram(id: string, userId: string, updateData: any) {
    // Verify ownership
    const diagram = await this.getDiagramById(id, userId);
    
    if (!diagram) {
      throw new NotFoundException('Diagram not found');
    }
 
    // Update only allowed fields
    const updatePayload: any = {};
    
    if (updateData.generatedCode !== undefined) {
      updatePayload.generatedCode = updateData.generatedCode;
    }
    
    if (updateData.type !== undefined) {
      updatePayload.type = updateData.type;
    }
 
    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name;
    }
 
    if (Object.keys(updatePayload).length === 0) {
      return diagram; // Nothing to update
    }
 
    return this.umlRepository.update(id, updatePayload);
  }
}