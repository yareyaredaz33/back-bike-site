import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './Filters/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors({ credentials: true, origin: 'http://localhost:5173' });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];
        errors.forEach((error) => {
          const constraintsKeys = Object.keys(error.constraints);
          constraintsKeys.forEach((constraintsKey) => {
            errorsForResponse.push({
              message: error.constraints[constraintsKey],
              field: error.property,
            });
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3001);
}

bootstrap();
