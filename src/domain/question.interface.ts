import { Answer } from './answer.interface';

export interface Question {
  uuid: string;
  answerOptions: Answer[];
}
