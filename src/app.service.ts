import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  createPoll(): string {
    return 'Hello World!';
  }
}
