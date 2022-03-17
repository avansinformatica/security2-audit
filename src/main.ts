import * as dotenv from "dotenv";

dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


const logger = require('node-color-log');
const cors = require('cors');

async function bootstrap() {
	logger.color('green').bold().log(`
  ▄▀█ █░█ ▄▀█ █▄░█ █▀   █░█ █▀█ █ █▀▄
  █▀█ ▀▄▀ █▀█ █░▀█ ▄█   ▀▄▀ █▄█ █ █▄▀ 
  ▄▀█ █▀█ █
  █▀█ █▀▀ █`)
	const app = await NestFactory.create(AppModule);
	const port: number = parseInt(`${process.env.PORT}`) || 3000;
	console.log("running on port", port);
	app.use(cors());
	await app.listen(port);
}

bootstrap();
