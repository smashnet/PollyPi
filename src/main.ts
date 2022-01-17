import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as nunjucks from 'nunjucks';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const express = app.getHttpAdapter().getInstance();
  const assets = join(__dirname, '..', 'public');
  const views = join(__dirname, '..', 'src', 'ui', 'views');

  nunjucks.configure(views, {
    autoescape: true,
    watch: true,
    noCache: process.env.NODE_ENV === 'local' ? true : false,
    express,
  });

  app.useStaticAssets(assets);
  app.setBaseViewsDir(views);
  app.setViewEngine('njk');

  await app.listen(3000);
}
bootstrap();
