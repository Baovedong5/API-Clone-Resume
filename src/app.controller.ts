import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  // private appService: AppService
  // constructor(appService: AppService) {
  //this.appService = appService
  //}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
