import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersController } from './customers/customers.controller';
import { CatsController } from './cats/cats.controller';
import { OrderModule } from './order/order.module';
import { TestController } from './test/test.controller';

@Module({
  imports: [OrderModule],
  controllers: [AppController, CustomersController, CatsController, TestController],
  providers: [AppService],
})
export class AppModule {}
