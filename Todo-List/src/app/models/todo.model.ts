import { Person } from './person.model';
import { Priority } from './priority.enum';
import { Label } from './label.enum';

export interface Todo {
  id?: number;
  titre: string;
  person: Person;
  startDate: Date;
  endDate?: Date;
  priority: Priority;
  labels: Label[];
  description: string;
  completed?: boolean;
}
