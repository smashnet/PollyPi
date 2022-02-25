import { Controller, Get, Logger, Render, UseGuards } from '@nestjs/common';
import { userFrom } from 'src/domain/user.interface';
import { PollService } from 'src/poll/poll.service';
import { Cookies } from 'src/util/cookie.decorator';
import { NoUserGuard } from 'src/util/nouser.guard';

@Controller('my')
export class MyController {
  private readonly logger = new Logger(MyController.name);
  constructor(private readonly pollService: PollService) {}

  @Get()
  @Render('list_polls')
  @UseGuards(NoUserGuard)
  listMyPolls(@Cookies('name') name: string, @Cookies('uuid') uuid: string) {
    const user = userFrom(name, uuid);
    return {
      user: user,
      polls: this.pollService.findByUser(user),
    };
  }
}
