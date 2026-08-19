import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('SSIU_ERP_Backend');
  const app = await NestFactory.create(AppModule);

  // Global Response Transform Interceptor & Exception Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Payload Size Limits & Anti-DOS Protection
  const express = require('express');
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Security Headers Middleware
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Enable CORS for SSIU ERP Frontend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // OpenAPI / Swagger Interactive Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SSIU ERP Enterprise Production REST API')
    .setDescription(
      'Official REST API platform for Swarrnim Startup & Innovation University ERP system (Core Governance, People, Auth, and RBAC Authority Subsystems).'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 SSIU ERP Production Backend Engine listening on http://localhost:${port}`);
  logger.log(`📖 OpenAPI / Swagger Live Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔐 Authentication Endpoints active: http://localhost:${port}/api/v1/auth/login`);
  logger.log(`🏥 Health endpoints active: http://localhost:${port}/health & http://localhost:${port}/api/v1/health`);
}
bootstrap();
