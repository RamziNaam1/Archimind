import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SecretsService } from './config/secrets.service';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const secrets = app.get(SecretsService);

  app.setGlobalPrefix('api');

  // S'assurer que les dossiers nécessaires existent
  const dirs = ['./uploads', './uploads/diagrams'];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Servir les fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('🛸 UML GENERATOR API')
    .setDescription(
      `Bienvenue dans le moteur backend du PFA UML. Toutes les routes métier sont sous le préfixe /api`,
    )
    .setVersion('1.2')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customCssUrl: '/public/swagger.css',
    customSiteTitle: 'UML Generator API Docs',
    swaggerOptions: { persistAuthorization: true },
  });

  app.enableCors();

  const port = secrets.port || 3001;
  
  // Démarrage robuste
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 API en ligne sur : http://localhost:${port}/api`);
  console.log(`📖 Docs en ligne sur : http://localhost:${port}/docs`);
}

// Gestion propre pour éviter les erreurs de port déjà utilisé en développement
bootstrap().catch((err) => {
  console.error('Erreur lors du démarrage du serveur :', err);
  process.exit(1);
});