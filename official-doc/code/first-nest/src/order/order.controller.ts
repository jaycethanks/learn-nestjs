import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
  findAll() {
    return 'GET methods findAll';
  }
  @Post()
  create() {
    return 'Post methods create';
  }
  @Patch()
  update() {
    return 'Patch methods update';
  }
  @Delete()
  remove() {
    return 'Delete methods remove';
  }
}
