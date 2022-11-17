## Providers

在 Nest 中， Providers 是基础的概念， 很多基本的 Nest Classes 都可能被作为一个 provider, 例如 services, repositories, factories, helpers, 等等。

provider 的主要思想就是他能够被 **injected** 作为一个依赖， 这意味着 对象能够彼此之间创建各种关系。



### Services

创建一个简单的 Service

```js
//cats.service.ts
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

```js
//interfaces/cat.interface.ts
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```



> :tipping_hand_man: : 通过 `nest g service cats` 可以快速生成一个 cats service



controller 是如何与 service 关联的 ?

```js
//cats.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

> 注意这里的