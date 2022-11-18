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

> `CarsService` 通过 `CatsController` 的构造函数注入，其中通过 `private` 修饰符修饰的 `catsService` 是一个成员变量声明的简写。
>
> ```js
> class Department {
>   id: string;
>   departname: string;
>   constructor(id: string, departname: string) {
>     this.id = id;
>     this.departname = departname;
>   }
> }
> // 等同于
> class Department {
>   constructor(private id: string, public departname: string) {}
> }
> ```

### Dependency injection

以上示例中：

```js
  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
```

之所以可以直接通过 `this.catsService.create()` 调用 Service 中的方法，原因是，Nest 在背后做了处理，叫做依赖注入。 

```js
constructor(private catsService: CatsService) {}
```

Nest 会创建 CatsService 的示例并赋值给 catsService 成员变量。





本章节涉及到依赖注入的部分可以参看这里：

https://www.bilibili.com/video/BV1NG41187Bs?p=10&spm_id_from=pageDriver&vd_source=1a939f65e5f7333a6191746cf99398dd

小满的nestjs 课程