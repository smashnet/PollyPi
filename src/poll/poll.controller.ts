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
} from '@nestjs/common';
import { PollService } from './poll.service';
import { v4 as uuidv4 } from 'uuid';
import { AddQuestionDto } from './dto/add-question.dto';

@Controller('poll')
export class PollController {
  private readonly logger = new Logger(PollController.name);
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
    return { poll: { code: newPollCode }, selectedQuestion: 1 };
  }

  @Post(':code/edit/question/:questionNumber')
  @Render('create_poll')
  addQuestion(
    @Body() addQuestionDto: AddQuestionDto,
    @Param('code') code: string,
    @Param('questionNumber') qNo: string,
  ) {
    this.logger.log(`New question arrived: ${JSON.stringify(addQuestionDto)}`);
    const poll = this.pollService.addQuestion(code, qNo, addQuestionDto);
    this.logger.log(
      `Added question to poll ${code}: ${JSON.stringify(
        poll.questions.get(qNo),
      )}`,
    );
    console.log(addQuestionDto);
    if (addQuestionDto.editQuestion) {
      console.log(poll);
      return { poll: poll, selectedQuestion: qNo };
    } else {
      return { poll: poll, selectedQuestion: String(poll.questions.size + 1) };
    }
  }

  @Get(':code/edit/open')
  @Render('open_poll')
  openPoll(@Param('code') code: string) {
    const poll = this.pollService.openPoll(code);
    return { poll: poll };
  }

  @Get(':code/edit/close')
  //@Render('open_poll')
  closePoll(@Param('code') code: string) {
    this.pollService.closePoll(code);
  }

  @Get(':code/edit/question/:number')
  @Render('create_poll')
  showQuestion(@Param('code') code: string, @Param('number') qNo: string) {
    return {
      poll: this.pollService.findOne(code),
      selectedQuestion: qNo,
      viewMode: true,
    };
  }

  @Get(':code/edit/question/:number/edit')
  @Render('create_poll')
  editQuestion(@Param('code') code: string, @Param('number') qNo: string) {
    return {
      poll: this.pollService.findOne(code),
      selectedQuestion: qNo,
      editQuestion: true,
    };
  }

  @Get(':code/edit/question/:number/delete')
  @Render('create_poll')
  deleteQuestion(@Param('code') code: string, @Param('number') qNo: string) {
    const poll = this.pollService.deleteQuestion(code, qNo);
    console.log(poll.questions);
    return {
      poll: poll,
      selectedQuestion: nextSelectedQuestion(qNo),
      deletedQuestion: qNo,
      viewMode: true,
    };
  }

  @Get('participate')
  @Redirect('/poll', 302)
  participate(@Query('code') code: string) {
    return { url: `/poll/${code}` };
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.pollService.findOne(code);
  }
}

function nextSelectedQuestion(deletedQuestion: string): string {
  if (deletedQuestion === '1') return '1';
  return String(parseInt(deletedQuestion) - 1);
}
