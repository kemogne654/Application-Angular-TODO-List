import { Routes } from '@angular/router';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { PersonListComponent } from './components/person-list/person-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/todos', pathMatch: 'full' },
  { path: 'todos', component: TodoListComponent },
  { path: 'persons', component: PersonListComponent },
  { path: '**', redirectTo: '/todos' },
];
