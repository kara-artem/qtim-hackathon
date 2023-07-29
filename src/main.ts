import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { config } from './common/config';

(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // app.enableCors({
  //   origin: [process.env.APP_URL as string, /^http:\/\/localhost/],
  // });
  app.enableCors({ origin: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`Swagger ${config.get('PROJECT_NAME')}`)
    .setDescription(`${config.get('PROJECT_NAME')} API routes`)
    .setVersion('1.0')
    .setExternalDoc('JSON version', `${config.get('HOST_URL')}/docs-json`)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  await app.listen(config.get<number>('PORT', 3000));
})();
