import { User } from './user.interface';

export interface Answer {
  letter: string;
  text: string;
  answeredBy: User[];
}
