import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true, credentials: true });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ruta B2B API')
    .setDescription('API para operación de venta por ruta (sin almacén)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  /** GET / sin prefijo: evita 404 si abres solo la URL base del servidor. */
  app.getHttpAdapter().get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      ok: true,
      service: 'ruta-api',
      message: 'La API REST está bajo /api/v1. Ejemplo: GET /api/v1',
      api: '/api/v1',
      docs: '/api',
    });
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
