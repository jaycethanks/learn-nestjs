import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { FileModule } from './file/file.module';
=======
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
>>>>>>> 3639574a4e8a2766ac8c4bd9b0479e6f2153c5d8

import { ServeStaticModule } from '@nestjs/serve-static';
//https://github.com/nestjs/serve-static
import { join } from 'path';

//https://docs.nestjs.com/recipes/serve-static
@Module({
<<<<<<< HEAD
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/files',
      //https://github.com/nestjs/serve-static/issues/26#issuecomment-590070135
    }),
    FileModule,
  ],
=======
  imports: [AuthModule, UserModule],
>>>>>>> 3639574a4e8a2766ac8c4bd9b0479e6f2153c5d8
})
export class AppModule {}
