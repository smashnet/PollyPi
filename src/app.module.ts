import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollModule } from './poll/poll.module';
import { MyController } from './my/my.controller';

@Module({
  imports: [PollModule],
  controllers: [AppController, MyController],
  providers: [AppService],
})
export class AppModule {}
