import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MyUKConnect E-commerce API')
    .setDescription('API documentation for the UK shopping and delivery service.')
    .setVersion('1.0')
    //.addTag('auth', 'User authentication and role management')
    //.addTag('products', 'Inventory management by Admin')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Access docs at /api/docs
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
