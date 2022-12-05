## Authentication

**认证** 是大多数应用程序中非常重要的部分. 有很多不同的方法和策略去处理 **认证**, 根据不同的要求决定。

本章节展示了几种不同方式，这些方式通常是能够适用于大多数情况的。

**Passport** 是node.js 中最流行的 用于认证处理逻辑的 库，在社区范围广为人知，并被应用于很多生产应用。  Next.js 也专门封装了 `@nestjs/passport` module, 用于简单快速的整合 Nestjs 应用。 在较高的层级上来看，Passport 执行了一系列的步骤：

- 通过用户的 “credentials" (例如， 用户名/密码，JSON Web Token( **JWT** ), 或者由认证提供商提供的 identity token 标识token) 的校验来认证一个用户。
-  管理 已经认证的状态 (通过发布一个可移植令牌(如JWT)或创建一个Express会话)。
- 将有关身份验证的用户信息附加到请求对象，以在路由处理程序中进一步使用。

Passport 有着丰富的 策略([strategies](http://www.passportjs.org/) ) 生态，这些策略实现了各种 认证 机制。 你可以根据你的需要选择各种策略， Passport 将上述的这些不同的步骤 抽象为标准的 模式(pattern)，且 `@nestjs/passport` 的作用就是将 这个 模式(pattern) 包装并序列化成更熟悉的 Nest 的结构。

在本章节中，我们将会利用这些强大，灵活的模块，为一个 RESTful API 服务实现一个完整的 end-to-end 认证解决方案。 你可以使用本章中所描述的各种概念去实现任何 Passport 策略以实现自定义你的验证逻辑。 你可以跟着这些步骤去构建这个完整的示例，也可以在这里看到完整的示例代码 [here](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt).



### Authentication requirements

在这里用例中，客户端将会发送 username 和 password, 一旦认证完成， 这个服务器将会颁发一个 JWT 用以在客户端后续的请求中，作为 [bearer token in an authorization header](https://tools.ietf.org/html/rfc6750)  (请求头中的 bearer token) 携带到服务端，以作为认证成功的凭证。 我们还会创建一个受保护的路由，该路由将只能够被携带 有效 JWT 的请求访问。



我们将会从验证一个用户开始，然后将会扩展实现JWT 颁发，最后我们将会创建一个受保护的路由。



首先，先安装需要的依赖包：

`passport-local`: 实现了一个 username/password 验证机制，很适合我们用例的这一部分需求。

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
```

> :notebook_with_decorative_cover: 对于你所选择的 任何 Passsport 策略，你始终都会需要 `@nestjs/passport` 和 `passport` 这两个包依赖。 然后，你需要安装安装策略对应的包，这些包实现了了特定的认证策略（例如`passport-jwt`, 或者 `passport-local`）。 此外，你也可以为任何 Passport 策略安装类型声明文件 `@types/passport-local` ，这将会提供代码提示。



### 实现 Passport 策略

我们将会先从一个所有 Passport 策略都通用的过程开始。把 Passport 视作一个迷你框架将会比较有帮助。 该框架的优雅之处在于，它将身份验证过程抽象为几个基本步骤，您可以根据所实现的策略自定义这些步骤。它很像一个框架是因为你通过提供自定义的参数（作为 plain JSON 对象）和 Passport 将会在合适时机执行的自定义回调函数进行配置。`@nestjs/passport` module 将这个框架包装包装成为一个 Nest 风格的依赖包，使得他易于整合到 Nest 应用。 我们接下来将会使用 `@nestjs/passport`， 但是在此之前，我们先思考一下 原生 的 Passport 是如何工作的。

在原生 Passport 中， 你可以配置一个策略，通过提供两个东西：

1. 一系列的配置项用于特定的策略，例如，在 JWT策略中，我可能需要提供一个 `secret` 去签名 token
2. 一个 "verify callback"（验证回调）， 这是你用于告诉 Passport 如何和你的 user store(你管理用户账户的地方) 进行通信。 在这里，你将会验证一个用户是否存在，以及他们的 credentials 凭证是否是有效的。 Passport 这个库 **期望** 验证成功时这个回调将返回一个完整的用户（a full user）, 失败则返回 `null` (包括了用户不存在，密码错误)

**通过 `@nestjs/passport` ， 你可以通过 继承 `PassportStrategy` 这个类以配置 Passport 策略。  你可以在你的子类中通过 `super()` 传递 策略配置项（上述item1）， 通过重写 `validate()` 方法提供你自己的 verify callback（上述item2）。**

我们将会从 创建 `AuthModule` ，`AuthService`开始:

```bash
$ nest g module auth
$ nest g service auth
```

当我们实现 `AuthService` 的时候，我们会发现在UsersService中封装用户操作非常有用，所以现在让我们生成该模块和服务：

```bash
$ nest g module users
$ nest g service users
```



将自动生成的内容替换成以下内容。对于我们这个简单的应用， `UserService`简单的维护了一份硬编码的用户列表。 以及一个 find 方法用于 检索到匹配的用户，在实际的应用中。 这里用于和数据库做交互。 

```js

//users/users.service.ts
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
```

在 `UserModal` 中，唯一的修改，是需要添加`UserService`   到 `@Module` 修饰器的 exports 数组，这样，就能够在module之外访问到这个 `UserModal` 了。（我们很快就会用到了）

```diff
//users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
+  exports: [UsersService],
})
export class UsersModule {}
```

在我们的 `AuthService` ，我们创建了一个 `validateUser()` 方法以实现 检索匹配用户以及验证密码的功能。 在下方的代码，我们使用了 ES6 的扩展运算符用于从用户对象中剥离密码属性，然后再返回它。 我们稍后将会在 Passport local strtegy 本地策略中去调用这个 `validateUser()`  方法。 

```js
//auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
```

> :warning: 
>
> 当然，在实际的应用中，你不会将密码存储为明文，你或许可以使用一个叫做 bcrypt 的库，它有着单向哈希盐值算法。 通过这种方式，你就可以仅存储哈希计算后的密码。 然后将客户端用户提交上来的密码同样哈希计算后和数据库存储的哈希密码比对以验证正确性。 因此，永远不要存储以及暴露用户的秘密为明文。 为了保持我们用例的简洁性，我们这里直接用明文。 

现在，我们更新我们的 `AuthModule` ，引入`UserModule`

```diff
//auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
+ import { UsersModule } from '../users/users.module';

@Module({
+  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
```

### 实现 Passport local (实现Passport 本地策略)

现在我们可以实现我们 Passport 的本地认证策略了 （local authentication strategy）。创建一个名为 `local.strategy.ts` 的文件在 `auth` 目录下。 并添加如下代码：

```js
//auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

我们遵循了先前为所有 Passport 策略所描述的要素。 在我们的例子中，我们直接使用了 passport-local, 它并没有提供 配置选项（configutaion options）, 所以我们的构造器仅简单的调用`super()`，没有提供配置选项。 

> :notebook_with_decorative_cover: 
>
> 我们前面也说过了，我们可以在继承 PassportStrategy 的LocalStrategy 子类的构造器中，通过调用 `super()` 方法，并向其传递配置选项以自定义Passport 策略的行为。 在这个示例中，passport-local 策略默认期望接受 **请求体(request body)** 中名为 `username` 以及 `password` 的属性。 可以通过传递一个选项对象以指定需要的属性名，例如： `super({usernameField:"email"})`。 需要更多相关信息可以参考 [Passport documentation](http://www.passportjs.org/docs/configure/) 。

我们也实现了 `valiated()` 方法，对于每个策略， Passport 将会以特定的策略所指定的一组参数，将这个方法作为验证函数调用。对于我们这里的 local-strategy, Passport 期望 `validate()` 方法有着这些签名 ：`validate(username:string, password:string):any`。

多数的验证工作在我们的 `AuthService` 中已经完成了（在`UserService`的帮助下，因为我们实际的方法实现是在这里面），所以这个方法是相当的直接了当。 **任何** Passport 策略的  `validate()`  方法都会尊从一个简单的 pattern(模板/模式)， 只是在表示凭据(credentials)的细节上有所不同。如果一个用户匹配到了，并且这个凭据是有效的。 这个用户将会返回，因此 Password 也将完成其工作。请求的Handling 管道流也会继续。如果没有匹配用户，我们将会抛出一个 exception, 并让我们的 exception 曾处理它。

> @jayce: 可以将认证视作门卫，请求就像是送外卖，门卫的作用只是验证小哥身份，验证通过，小哥就会继续工作。 



通常，每个 策略 中的 `validate()` 方法，最显著的不同之处在于，你是如何验证用户是不是存在，以及凭据是否有效。  例如， 在 JWT 策略中，取决于需求，我们可能会计算 解码后的 token 中携带的 `userId`是否能和我们数据库中的用户记录匹配，或者匹配撤销令牌的列表。 因此，这种子类化和实现特定策略验证的模式是一致的、优雅的和可扩展的。



我们需要配置我们的 `AuthModule` 去使用我们刚才定义的 Passport features(功能/能力/特性)。  将 `auth.module.ts` 更新为以下内容：

```diff
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
+ import { PassportModule } from '@nestjs/passport';
+ import { LocalStrategy } from './local.strategy';

@Module({
- imports: [UsersModule],
+ imports: [UsersModule, PassportModule],
- providers: [AuthService],
+ providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
```

### 内置的 Passport 守卫（Guards）

[Guards](https://docs.nestjs.com/guards) 章节描述了 Guards 的主要功能： 用于判定一个请求是否能够被 router handler 所处理（handled）, 在本章节中，这仍然是没错的， 我们也很快将会用到这个标准的能力。 不过，在涉及`@nestjs/passport` 的时候， 我们将会介绍一个可能一开始会让人感到困惑的新问题。 因此，让我们现在来讨论一下。 思考一下，你的应用可能会存在两种状态。从一个认证(authentication)的层面来看:

1. 用户没有登入 ( 没有被认证 )
2. 用户登入了 ( 被认证了 )

在第一种情况中，也就是用户没登入时，我们需要执行两个不同的功能：

- 限制未经认证的用户能够直接访问的路由 (这里的路由指的是后端API 的 url path)。 我们将会使用 Guards 实现这个功能。 通过在 需要被保护的 路由上方放置一个 Guard, 如你所料，我们将会在这个守卫中检查 JWT 的有效性存在。 因此，我们稍后将会实现它。  
- 当以前未经身份验证的用户试图登陆的时候，启动身份验证步骤本身。 这一步中，我们将向有效用户颁发 JWT。 想一想，我们知道我们需要一个裹挟着 `username/password` 凭证的 POST 请求去启动认证。 因此我们将会设定一个 `POST /auth/login` 的路由去handle这个请求。 这也引发了一个进一步的问题，我们的passport-local 策略究竟如何被触发 ？

答案是很直接的： 通过使用**另外一个，稍有不同的类型的 Guard**。 `@nestjs/passport` module 提供给我们了一个内置的 Guard 用以帮助我们完成该工作。 该Guard 将会触发 Passport 策略，并开始执行上面描述的步骤 （检查匹配用户账户密码，执行验证函数(verify function)，创建 `user` 属性, 等等）



上面列举的第二种情况(已登录用户) **仅仅依赖于我们已经讨论过的标准Guard类型**，以允许已登录用户访问受保护的路由。



### Login route 登录路由