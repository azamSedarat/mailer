import { CacheModule, Module } from "@nestjs/common";
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-ioredis'

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:1234@localhost/', {
      dbName: 'mailer',
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,

      host: 'localhost',
      port: 6379,
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
