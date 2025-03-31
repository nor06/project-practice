import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // Allow Angular frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Enable cookies if needed
  });

  const port = process.env.PORT || 3000; // Use the PORT from environment variables or default to 3000
  try {
    await app.listen(port);
    console.log(`Server is running on: http://localhost:${port}`);
  } catch (error) {
    console.error(`Failed to start the server on port ${port}`, error);
  }
}
bootstrap();
