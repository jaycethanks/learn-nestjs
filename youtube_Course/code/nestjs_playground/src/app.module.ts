import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';

import { ServeStaticModule } from '@nestjs/serve-static';
//https://github.com/nestjs/serve-static
import { join } from 'path';

//https://docs.nestjs.com/recipes/serve-static
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/files',
      //https://github.com/nestjs/serve-static/issues/26#issuecomment-590070135
    }),
    FileModule,
  ],
})
export class AppModule {}
