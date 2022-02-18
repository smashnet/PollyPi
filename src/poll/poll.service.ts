import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { AddQuestionDto } from './dto/add-question.dto';
import { Poll } from 'src/domain/poll.interface';
import { Question } from 'src/domain/question.interface';
import { Answer } from 'src/domain/answer.interface';

@Injectable()
export class PollService {
  private readonly logger = new Logger(PollService.name);
  private polls = new Map();

  create(createPollDto: CreatePollDto) {
    const poll = {
      code: getRandomCode(),
      owner: createPollDto.owner,
      participants: [],
      published: false,
      finished: false,
      questions: new Map<string, Question[]>(),
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
    this.polls.set(poll.code, poll);
    return poll.code;
  }

  addQuestion(code: string, qNo: string, addQuestionDto: AddQuestionDto): Poll {
    const poll = this.findOne(code);
    poll.questions.set(qNo, questionFromDto(addQuestionDto));
    return poll;
  }

  findAll() {
    return `This action returns all poll`;
  }

  findOne(code: string): Poll {
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
  return uuidv4().substring(0, 8);
}

function questionFromDto(dto: AddQuestionDto): Question {
  const answerMap = new Map<string, Answer>();
  dto.answerOptions.forEach((item, i) =>
    answerMap.set(letterFromIndex(i), { text: item }),
  );
  return {
    question: dto.question,
    answerOptions: answerMap,
  };
}

function letterFromIndex(i: number): string {
  return String.fromCharCode(i + 65);
}
