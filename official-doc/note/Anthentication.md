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



将自动生成的内容替换成以下内容。对于我们这个简单的应用， `UserService`简单的维护了一份硬编码的用户列表。 以及一个 find 方法用于