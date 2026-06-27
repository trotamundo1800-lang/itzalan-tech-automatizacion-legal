import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateContactoDto } from './dto/create-contacto.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus() {
    return this.appService.getStatus();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Post('api/contacto')
  @HttpCode(HttpStatus.OK)
  submitContacto(@Body() payload: CreateContactoDto) {
    return this.appService.submitContacto(payload);
  }
}
