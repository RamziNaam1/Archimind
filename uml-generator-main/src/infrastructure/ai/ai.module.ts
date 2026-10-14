import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { DatasetService } from './dataset.service';
import { DatasetController } from './dataset.controller';
import { LlamaService } from './llama.service';

@Global()
@Module({
  controllers: [DatasetController],
  providers: [AiService, DatasetService, LlamaService],
  exports: [AiService, DatasetService, LlamaService],
})
export class AiModule {}
