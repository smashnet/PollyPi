import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { Logger } from '@nestjs/common';
import { Poll } from 'src/domain/poll.interface';
import { Question } from 'src/domain/question.interface';
import { User } from 'src/domain/user.interface';
import {
  getRandomCode,
  indexFromLetter,
  listContainsUser,
  usersAreEqual,
} from 'src/util/utils';
import { writeFile } from 'fs';

@Injectable()
export class PollService {
  private readonly logger = new Logger(PollService.name);
  private pollsSaveFile = './polls.json';
  private polls = new Array<Poll>();

  create(createPollDto: CreatePollDto) {
    const poll = {
      code: getRandomCode(),
      owner: createPollDto.owner,
      participants: [],
      open: false,
      questions: new Map<string, Question>(),
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
    poll.questions.set(qNo, newQuestion);
    this.savePolls();
    return poll;
  }

  deleteQuestion(code: string, qNo: string): Poll {
    // Delete actual question
    const poll = this.findOne(code);
    const lastQuestionKey = poll.questions.size;
    poll.questions.delete(qNo);
    // Rearrange remaining question indices
    poll.questions.forEach((v, k) => {
      if (k > qNo) poll.questions.set(String(parseInt(k) - 1), v);
    });
    poll.questions.delete(String(lastQuestionKey));
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
        poll.questions.get(qNo).answerOptions[indexFromLetter(answer)]
          .answeredBy,
        user,
      )
    ) {
      return false;
    }
    poll.questions
      .get(qNo)
      .answerOptions[indexFromLetter(answer)].answeredBy.push(user);
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
    writeFile(this.pollsSaveFile, JSON.stringify(this.polls), (err) => {
      if (err) throw err;
    });
  }
}

function savePollParticipant(poll: Poll, user: User) {
  if (!listContainsUser(poll.participants, user)) {
    poll.participants.push(user);
  }
}
