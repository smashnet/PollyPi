import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Logger,
  Redirect,
  Query,
  UseGuards,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PollService } from './poll.service';
import { AddQuestionDto } from './dto/add-question.dto';
import { NoUserGuard } from 'src/util/nouser.guard';
import { Cookies } from 'src/util/cookie.decorator';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { Question } from 'src/domain/question.interface';
import { Answer } from 'src/domain/answer.interface';
import { User } from 'src/domain/user.interface';
import { letterFromIndex, listContainsUser } from 'src/util/utils';
import { Poll } from 'src/domain/poll.interface';
import { config } from 'src/config';

@Controller('poll')
@UseGuards(NoUserGuard)
export class PollController {
  private readonly logger = new Logger(PollController.name);
  constructor(private readonly pollService: PollService) {}

  @Post('create')
  @Render('create_poll')
  create(@Cookies('name') name: string, @Cookies('uuid') uuid: string) {
    const createPollDto = {
      owner: {
        name: name,
        uuid: uuid,
      },
    };
    const newPollCode = this.pollService.create(createPollDto);
    return {
      user: {
        name: name,
        uuid: uuid,
      },
      poll: { code: newPollCode },
      selectedQuestion: 1,
    };
  }

  @Post(':code/edit/question/:questionNumber')
  @Render('create_poll')
  addQuestion(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Body() addQuestionDto: AddQuestionDto,
    @Param('code') code: string,
    @Param('questionNumber') qNo: string,
  ) {
    this.logger.log(`New question arrived: ${JSON.stringify(addQuestionDto)}`);
    const poll = this.pollService.addQuestion(
      code,
      qNo,
      questionFromDto(addQuestionDto),
    );
    this.logger.log(
      `Added question to poll ${code}: ${JSON.stringify(
        poll.questions[parseInt(qNo) - 1],
      )}`,
    );
    if (addQuestionDto.editQuestion) {
      return {
        user: {
          name: name,
          uuid: uuid,
        },
        poll: poll,
        selectedQuestion: qNo,
        viewMode: true,
      };
    } else {
      return {
        poll: poll,
        selectedQuestion: String(poll.questions.length + 1),
      };
    }
  }

  @Get(':code/edit/open')
  @Render('open_poll')
  openPoll(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Param('code') code: string,
  ) {
    const poll = this.pollService.openPoll(code);
    return {
      user: {
        name: name,
        uuid: uuid,
      },
      poll: poll,
      poll_url: `${config.base_url}/poll/${poll.code}`,
    };
  }

  @Get(':code/edit/close')
  //@Render('open_poll')
  closePoll(@Param('code') code: string) {
    this.pollService.closePoll(code);
  }

  @Get(':code/edit/question/:number')
  @Render('create_poll')
  showQuestion(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Param('code') code: string,
    @Param('number') qNo: string,
  ) {
    return {
      user: {
        name: name,
        uuid: uuid,
      },
      poll: this.pollService.findOne(code),
      selectedQuestion: qNo,
      viewMode: true,
    };
  }

  @Get(':code/edit/question/:number/edit')
  @Render('create_poll')
  editQuestion(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Param('code') code: string,
    @Param('number') qNo: string,
  ) {
    return {
      user: {
        name: name,
        uuid: uuid,
      },
      poll: this.pollService.findOne(code),
      selectedQuestion: qNo,
      editQuestion: true,
    };
  }

  @Get(':code/edit/question/:number/delete')
  @Render('create_poll')
  deleteQuestion(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Param('code') code: string,
    @Param('number') qNo: string,
  ) {
    const poll = this.pollService.deleteQuestion(code, qNo);
    return {
      user: {
        name: name,
        uuid: uuid,
      },
      poll: poll,
      selectedQuestion: nextSelectedQuestion(qNo),
      deletedQuestion: qNo,
      viewMode: true,
    };
  }

  // -------------- Play poll --------------

  @Get('participate')
  @Redirect('/poll', HttpStatus.TEMPORARY_REDIRECT)
  participate(@Query('code') code: string) {
    return { url: `/poll/${code}` };
  }

  @Get(':code')
  @Redirect('/poll/:code/question/1', HttpStatus.TEMPORARY_REDIRECT)
  redirect(@Param('code') code: string) {
    return { url: `/poll/${code}/question/1` };
  }

  @Get(':code/question/:qNo')
  playPollQuestion(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Param('code') code: string,
    @Param('qNo') qNo: string,
    @Res() res: Response,
  ) {
    const poll = this.pollService.findOne(code);
    const user = userFrom(name, uuid);
    if (!poll) {
      // poll does not exist
      return res.status(HttpStatus.NOT_FOUND).render('not_found', {
        user: user,
      });
    }
    const userAnswer = getUserAnswer(
      poll.questions[parseInt(qNo) - 1].answerOptions,
      user,
    );
    return res.status(HttpStatus.OK).render('play_poll', {
      user: user,
      poll: poll,
      userAnswer: userAnswer,
      selectedQuestion: qNo,
    });
  }

  @Post(':code/question/:qNo')
  answerQuestion(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Body() answerQuestionDto: AnswerQuestionDto,
    @Param('code') code: string,
    @Param('qNo') qNo: string,
    @Res() res: Response,
  ) {
    const poll = this.pollService.findOne(code);
    const qNoNext = nextQuestion(qNo);

    const success = this.pollService.answerQuestion(
      code,
      qNo,
      userFrom(name, uuid),
      answerFromDto(answerQuestionDto),
    );

    if (!success) {
      // User has already answered this question
      return res.status(HttpStatus.BAD_REQUEST).render('already_answered', {
        user: {
          name: name,
          uuid: uuid,
        },
        poll: poll,
        selectedQuestion: qNo,
      });
    }

    if (parseInt(qNoNext) > poll.questions.length) {
      // poll finished
      return res.render('finish_poll', {
        user: {
          name: name,
          uuid: uuid,
        },
        poll: poll,
      });
    } else {
      // next question
      return res.render('answer_stored', {
        user: {
          name: name,
          uuid: uuid,
        },
        poll: poll,
        nextQuestion: qNoNext,
      });
    }
  }

  // -------------- Poll Results --------------

  @Get(':code/results/:qNo')
  @Render('poll_results')
  showResults(
    @Cookies('name') name: string,
    @Cookies('uuid') uuid: string,
    @Param('code') code: string,
    @Param('qNo') qNo: string,
  ) {
    const poll = this.pollService.findOne(code);
    const user = userFrom(name, uuid);
    const results = prepareResults(poll);

    return {
      user: user,
      poll: poll,
      results: results,
      selectedQuestion: qNo,
    };
  }
}

function nextSelectedQuestion(deletedQuestion: string): string {
  if (deletedQuestion === '1') return '1';
  return String(parseInt(deletedQuestion) - 1);
}

function nextQuestion(qNo: string): string {
  return String(parseInt(qNo) + 1);
}

function questionFromDto(dto: AddQuestionDto): Question {
  const answers = new Array<Answer>();
  dto.answerOptions.forEach((item, i) =>
    answers.push({ letter: letterFromIndex(i), text: item, answeredBy: [] }),
  );
  return {
    question: dto.question,
    answerOptions: answers,
  };
}

function answerFromDto(dto: AnswerQuestionDto): string {
  return Object.keys(dto)[0];
}

function userFrom(name: string, uuid: string): User {
  return {
    name: name,
    uuid: uuid,
  };
}

function getUserAnswer(
  answerOptions: Answer[],
  user: User,
): string | undefined {
  const answer = answerOptions.find((answer) =>
    listContainsUser(answer.answeredBy, user),
  );
  return answer ? answer.letter : undefined;
}

function prepareResults(poll: Poll): any {
  const results = [];
  poll.questions.forEach((q) => {
    let qParticipants = 0;
    const qVotes = [];
    q.answerOptions.forEach((answer) => {
      qParticipants += answer.answeredBy.length;
      qVotes.push(answer.answeredBy.length);
    });
    results.push({
      total: qParticipants,
      votesPerAnswer: qVotes,
    });
  });
  return results;
}
