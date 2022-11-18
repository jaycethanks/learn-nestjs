import { OrderService } from './order.service';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    findAll(): string;
    create(): string;
    update(): string;
    remove(): string;
}
