## Controllers

一个Controller 的目的在于 **承接** 特定的 **一组请求**。 路由机制控制着 将请求分发给不同的请求。 通常，一个 Controller 下有多个 route,不同的 routes 也将接收不同的请求，并做出不同的逻辑操作，和不同的回应。 

在 nest 中，创建路由通过  装饰器 Decorators 和 Classes 组合实现，nest 用这种机制构建了一个路由表（routing map）。

>  说是借鉴了 Augular 的思想，但是和 SpringBoot 更像。 Decorator 是语言层面的支持的ES6特性。

> :tipping_hand_man:: 通过 `nest g resource [name]` 可以快速自动生成一个 CRUD Controller

### 1. Routing



#### 1.1 路由匹配

##### 1.1.1 根 route

一个最基本的Controller 是这样的：

```js
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

这个 Controller 将匹配 `"/"` 这个path的请求。 

##### 1.1.2 一级 route 和 嵌套 route

再比如这个：

```js
@Controller('customers')
export class CustomersController {
  @Get()
  getAll() {
    return 'all customers here.';
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
```

能够匹配到 `"/customers"` 和 `"/customers/profile"` 以及 `"/customers/test/a/b/c/d"`这三个 path 的请求。 

##### 1.1.3 REST route

nest 通过 Decorator 很完美的支持了 REST 风格的API, 一个简单的示例如下：

```js
@Controller('order')
export class OrderController {
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
```

这个 Controller 能够匹配 `/order` 这同一个 path 的不同 method 请求。分别是 `GET /order`,  `Post /order`, `Patch /order`, `Delete /order`。

> Nest 提供了所有的标准 HTTP 请求 methods : `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`, `@Options()`, 以及 `@Head()`. 
>
>  In addition, `@All()` defines an endpoint that handles all of them.



#### 1.2 路由通配符

Nest 也支持匹配基于 正则表达式 的路由匹配， 例如：

```typescript
@Get('ab*cd')
findAll() {
  return 'This route uses a wildcard';
}
```

这个路由将能够匹配 到`abcd`,`ab_cd`,`abecd`等等，

> 这里的正则匹配规则是正则表达式的子集， `-` 和 `.` 将不具有正则匹配意义，将作为字符串匹配。
>
> The characters `?`, `+`, `*`, and `()` may be used in a route path, and are subsets of their regular expression counterparts. The hyphen ( `-`) and the dot (`.`) are interpreted literally by string-based paths.



#### 1.3 路由参数

Nest 支持匹配动态的路由参数，我们在 Handler 的上下文中可以通过`@Param()` 装饰器去访问到路由参数。

例如：

```js
@Controller('customers')
export class CustomersController {
  @Get(':id')
  getOne(@Param() params) {
    return `Here is the profile of customer whose id is ${params.id}.`;
  }
}
```

请求 `"/customers/d234a52gsi234"`将会返回：

```
"Here is the profile of customer whose id is d234a52gsi234."
```

> `@Param()` 注解除了像上面那样将路由参数包装成一个对象访问，还可以这样传入参数，解构访问：
>
> ```js
> @Controller('customers')
> export class CustomersController {
>   @Get(':id')
>   getOne(@Param('id') id) {
>     return `Here is the profile of customer whose id is ${id}.`;
>   }
> }
> ```



#### 1.4 Request payloads

对于像POST 请求，这种 请求体中携带数据的请求 method, 我们可以通过 `@Body()` 装饰器 获取到请求体数据。

```js
@Post()
async create(@Body() createBody) {
  return 'This action adds a new cat';
}
```

在 TypeScript 中，我们需要定义一层类似 Java 中的modal 层实体类， 用于描述 Body 的数据结构。 这个层 在Nest 中被命名为一个 `xxxx.Dto.ts`文件。

如这个例子就可以被写作：

```js
//create-cat.dto.ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

```js
//cats.controller.ts
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

> 你应该始终用 class 去定义描述类型，尽管 interface 也可以，但是 interface 在编译过后就消失了，因为有一些Nest 特性可能在 runtime 阶段也是依赖这些 class。

### 2. Response 对象

nest 支持两种 Response 的返回操作

**Standard( recommended ) 标准**

nest 有内置方法，当一个request 返回一个 JavaScript 对象或者数组，将会被自动序列化， 如果是基本值类型，则直接返回。 这样的好处是不用每次去手动处理 Response 对象， 只返回值即可，其他的 nest 在后台帮你处理。 

默认地， Response 的 status code 始终是 `200`, 如果是 POST request 则是 `201` , nest 支持通过 `@HttpCode(...)` 装饰器去手动指定状态码。（[Status codes](https://docs.nestjs.com/controllers#status-code)）

**Library-specific**

也可以使用依赖的底层库原生的 response 对象，例如 Express, 要使用它， 需要通过 `@Res()` 装饰器去在 Handler 的参数上下文中注入， 例如 `findAll(@Res() response)`. 然后你就可以这样去返回 请求响应了 ： `response.status(200).send()`



### 3. Request 对象

Handler 经常需要访问来自客户端的请求信息， Nest 也提供了对底层平台的请求对象访问能力，像 Response 一样，我们也需要在 Handler 的参数上下文中通过 `@Req` 去注入。例如：

```js
@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```

但是一个完整的请求对象太臃肿了，所以 Nest 也并不推荐直接访问一个请求对象， 而是通过暴露的一些装饰器去单独访问 请求对象中的特性信息 （有点类似解构请求对象的意思）。 例如通过 `@Body()` 装饰器能够直接访问到 POST 请求的请求体内容， 通过 `@Query` 则可以直接访问到 GET 请求的 query 参数信息。类似的 Nest 还支持更多，如下表所示：

| 装饰器                    | “@jayce: 解构内容”                  |
| ------------------------- | ----------------------------------- |
| `@Request(), @Req()`      | `req`                               |
| `@Response(), @Res()`     | `res`                               |
| `@Next()`                 | `next`                              |
| `@Session()`              | `req.session`                       |
| `@Param(key?: string)`    | `req.params` / `req.params[key]`    |
| `@Body(key?: string)`     | `req.body` / `req.body[key]`        |
| `@Query(key?: string)`    | `req.query` / `req.query[key]`      |
| `@Headers(name?: string)` | `req.headers` / `req.headers[name]` |
| `@Ip()`                   | `req.ip`                            |
| `@HostParam()`            | `req.hosts`                         |

> :tipping_hand_man: : 如果以上对 Response ， Request 对象访问的 装饰器不够用，你甚至还可以自定义装饰器 : To learn how to create your own custom decorators, visit [this](https://docs.nestjs.com/custom-decorators) chapter.







### 4. Status Code

前面说过，对于一个成功的请求， 除了 POST 状态码是 `201` ，其他的状态码默认都是  `200` ,我们可以通过 `@HttpCode(...)`这个装饰器在 Handler 层面上去改变状态码

```js
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

> :tipping_hand_man: :  `HttpCode` 从 `@nestjs/common` 引入

通常，状态码并不是静态的，受制于很多因素， 这时候你可以通过 `@Res()` 去访问基础平台提供的 Response 对象去手动操作。



### 5. Headers `@Header()`

指定一个自定义的响应头，你可以使用 `@Header()` 装饰器

```js
@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new cat';
}
```

> :tipping_hand_man:: `Header` 从 `@nestjs/common` 引入



### 6. 重定向 `@Redirect()`

重定向一个响应到一个指定 URL ，你可以使用 `@Redirect()` 装饰器, 该装饰器接搜两个参数 `url` 和 `statusCode`

> 这两个参数都是可选的，`statusCode` 的默认值是 `302`

```js
@Get()
@Redirect('https://nestjs.com', 301)
```

有的时候，你想要根据一些逻辑，动态的指定 HTTP status code 和 重定向 url， 这时候你可以通过返回一个以下 shape 的对象来做到：

```js
{
  "url": string,
  "statusCode": number
}
```

返回的对象将会覆写通过 `@Redirect()` 指定的状态码和url

```js
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}
```



### 7. Asynchronicity 异步

大部分的数据操作都是异步的，Nest 也支持定义异步的 Handler, 你可以返回一个 Promise ，然后接下来 Nest 将会自动处理。

```js
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```



### Sub-Domin Routing(略)

### Scopes(略)







注意，上面提到的修改响应头信息的操作，例如自定义 Headers, 重定向 等， 除了通过Nest 提供的 装饰器之外，都可以通过 `@Res()`  访问到 底层平台的 Response 对象进行操作。