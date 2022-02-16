import { Injectable } from '@nestjs/common';
import { Poll } from 'src/domain/poll.interface';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PollService {
  polls = new Map();

  create(createPollDto: CreatePollDto) {
    let poll: Poll;
    poll.code = getRandomCode();
    poll.owner = createPollDto.owner;
    poll.participants = [];
    poll.published = false;
    poll.finished = false;
    poll.questions = [];
    this.polls.set(poll.code, poll);
    return poll.code;
  }

  findAll() {
    return `This action returns all poll`;
  }

  findOne(code: string) {
    return this.polls.get(code);
  }

  update(code: string, updatePollDto: UpdatePollDto) {
    return `This action updates a #${code} poll`;
  }

  remove(code: string) {
    return this.polls.delete(code);
  }
}

function getRandomCode(): string {
  return uuidv4().substring(0, 9);
}
