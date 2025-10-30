import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import { BadRequestException } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.log('❌ Validación:', errors);
        return new BadRequestException(errors);
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors();
  
  app.use('/public', express.static(join(__dirname, '..', 'public')));

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();