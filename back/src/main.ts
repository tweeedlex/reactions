import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Дозволяємо CORS для фронтенду
  app.enableCors({
    origin: 'http://localhost:5173', // Vite dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Глобальна валідація
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  await app.listen(3000);
  console.log('🚀 Сервер запущено на http://localhost:3000');
}
bootstrap();
