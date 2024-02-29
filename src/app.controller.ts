import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Exception, ExceptionCode } from './app.exception';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
