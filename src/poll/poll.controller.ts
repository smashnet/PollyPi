import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { UpdatePollDto } from './dto/update-poll.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post('create')
  @Render('create_poll')
  create() {
    const createPollDto = {
      owner: {
        uuid: uuidv4(),
        name: 'Nico',
      },
    };
    const newPollCode = this.pollService.create(createPollDto);
    return { poll: { code: newPollCode } };
  }

  @Get()
  findAll() {
    return this.pollService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.pollService.findOne(code);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Body() updatePollDto: UpdatePollDto) {
    return this.pollService.update(code, updatePollDto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.pollService.remove(code);
  }
}
