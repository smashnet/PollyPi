import { Controller, Get, Logger, Render } from '@nestjs/common';
import { PollService } from 'src/poll/poll.service';

@Controller('my')
export class MyController {
  private readonly logger = new Logger(MyController.name);
  constructor(private readonly pollService: PollService) {}

  @Get()
  @Render('list_polls')
  listMyPolls() {
    return { polls: this.pollService.findAll() };
  }
}
