import { Controller, Post, Get, Request, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppService } from './app.service';

import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  // private appService: AppService
  // constructor(appService: AppService) {
  //this.appService = appService
  //}
}
