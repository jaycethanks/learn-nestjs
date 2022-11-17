import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  find() {
    return 'test default';
  }
  @Get('ab.cd')
  findAll() {
    return 'test - findAll.';
  }
  @Get('ab-cd')
  func01() {
    return 'test - findAll.';
  }
}
