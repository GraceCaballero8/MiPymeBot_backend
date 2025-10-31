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
        console.log('❌ Validación:', errors);
        return new BadRequestException(errors);
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
