import { Answer } from './answer.interface';

export interface Question {
  question: string;
  answerOptions: Map<string, Answer>;
}
