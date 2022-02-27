import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { Logger } from '@nestjs/common';
import { Poll } from 'src/domain/poll.interface';
import { Question } from 'src/domain/question.interface';
import { User } from 'src/domain/user.interface';
import {
  getRandomCode,
  indexFromLetter,
  insertQuestion,
  listContainsUser,
  removeFromArray,
  usersAreEqual,
} from 'src/util/utils';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path = require('path');
import { config } from 'src/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRCode = require('qrcode');

@Injectable()
export class PollService {
  private readonly logger = new Logger(PollService.name);
  private pollsSaveDir = './data';
  private pollsSaveFile = 'polls.json';
  private polls = new Array<Poll>();

  constructor() {
    if (existsSync(path.join(this.pollsSaveDir, this.pollsSaveFile))) {
      const data = readFileSync(
        path.join(this.pollsSaveDir, this.pollsSaveFile),
        'utf8',
      );
      this.polls = JSON.parse(data);
    }
  }

  create(createPollDto: CreatePollDto) {
    const poll = {
      code: getRandomCode(),
      owner: createPollDto.owner,
      participants: [],
      open: false,
      questions: new Array<Question>(),
      dateCreated: new Date().toLocaleDateString('de', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    this.logger.log(
      `Created new poll with code: ${poll.code} - ${poll.dateCreated}`,
    );
    this.polls.push(poll);
    this.savePolls();
    return poll.code;
  }

  openPoll(code: string): Poll {
    const poll = this.findOne(code);
    poll.open = true;
    this.savePolls();
    createQRCode(poll.code);
    return poll;
  }

  closePoll(code: string): Poll {
    const poll = this.findOne(code);
    poll.open = false;
    this.savePolls();
    return poll;
  }

  addQuestion(code: string, qNo: string, newQuestion: Question): Poll {
    const poll = this.findOne(code);
    poll.questions = insertQuestion(poll.questions, qNo, newQuestion);
    this.savePolls();
    return poll;
  }

  deleteQuestion(code: string, qNo: string): Poll {
    // Delete actual question
    const poll = this.findOne(code);
    poll.questions = removeFromArray(qNo, poll.questions);
    this.savePolls();
    return poll;
  }

  answerQuestion(
    code: string,
    qNo: string,
    user: User,
    answer: string,
  ): boolean {
    const poll = this.findOne(code);
    savePollParticipant(poll, user);
    if (
      listContainsUser(
        poll.questions[parseInt(qNo) - 1].answerOptions[indexFromLetter(answer)]
          .answeredBy,
        user,
      )
    ) {
      return false;
    }
    poll.questions[parseInt(qNo) - 1].answerOptions[
      indexFromLetter(answer)
    ].answeredBy.push(user);
    this.savePolls();
    return true;
  }

  findAll(): Poll[] {
    return this.polls;
  }

  findOne(code: string): Poll {
    return this.polls.find((poll) => poll.code === code);
  }

  findByUser(user: User): Poll[] {
    return this.polls.filter((poll) => usersAreEqual(poll.owner, user));
  }

  remove(code: string) {
    this.polls = this.polls.filter((poll) => poll.code !== code);
    this.savePolls();
  }

  private savePolls() {
    if (!existsSync(this.pollsSaveDir)) {
      mkdirSync(path.join(this.pollsSaveDir));
    }
    writeFileSync(
      path.join(this.pollsSaveDir, this.pollsSaveFile),
      JSON.stringify(this.polls),
    );
  }
}

function savePollParticipant(poll: Poll, user: User) {
  if (!listContainsUser(poll.participants, user)) {
    poll.participants.push(user);
  }
}

function createQRCode(code: string) {
  QRCode.toFile(
    `./public/img/${code}.png`,
    `${config.base_url}/poll/${code}`,
    (err) => {
      if (err) throw err;
    },
  );
}
