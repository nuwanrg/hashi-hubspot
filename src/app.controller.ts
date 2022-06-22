import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


}

@Controller('cats')
export class CatsController {
  @Get("findAll")
  findAll(): string {
    return 'This action returns all cats';
  }
}
