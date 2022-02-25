import { Question } from './question.interface';
import { User } from './user.interface';

export interface Poll {
  code: string;
  owner: User;
  participants: User[];
  open: boolean;
  questions: Map<string, Question>;
  dateCreated: string;
}
