import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Todo } from '../../models/todo.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor(private mockDataService: MockDataService) {}

  getTodos(): Observable<Todo[]> {
    return of(this.mockDataService.getTodos());
  }

  addTodo(todo: Todo): Observable<Todo> {
    return of(this.mockDataService.addTodo(todo));
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return of(this.mockDataService.updateTodo(todo));
  }

  deleteTodo(id: number): Observable<void> {
    this.mockDataService.deleteTodo(id);
    return of();
  }
}
