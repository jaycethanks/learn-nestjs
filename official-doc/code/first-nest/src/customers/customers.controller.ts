import { Controller, Get, HostParam, Param } from '@nestjs/common';

@Controller('customers')
export class CustomersController {
  @Get(':id')
  getOne(@Param('id') id) {
    return `Here is the profile of customer whose id is ${id}.`;
  }
  @Get()
  getAll(@HostParam() hostParam) {
    return hostParam;
  }

  @Get('profile')
  getProfile() {
    return 'customer profile.';
  }
  @Get('test/a/b/c/d')
  getTest() {
    return 'this is a nested route test abcd.';
  }
}
