import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        // Extraer solo los mensajes de error de forma simple
        const messages = errors.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        );
        return new BadRequestException(messages);
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
