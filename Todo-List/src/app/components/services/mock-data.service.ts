import { Injectable } from '@angular/core';
import { Person } from '../../models/person.model';
import { Todo } from '../../models/todo.model';
import { Priority } from '../../models/priority.enum';
import { Label } from '../../models/label.enum';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private persons: Person[] = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33123456789',
    },
    {
      id: 2,
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '+33987654321',
    },
    {
      id: 3,
      name: 'Pierre Bernard',
      email: 'pierre.bernard@email.com',
      phone: '+33456789123',
    },
  ];

  private todos: Todo[] = [
    {
      id: 1,
      titre: 'Développer interface utilisateur',
      person: this.persons[0],
      startDate: new Date('2024-01-15'),
      endDate: undefined,
      priority: Priority.DIFFICILE,
      labels: [Label.HTML, Label.CSS],
      description: 'Créer une interface responsive avec Angular Material',
      completed: false,
    },
    {
      id: 2,
      titre: 'Intégrer API REST',
      person: this.persons[1],
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-01-25'),
      priority: Priority.MOYEN,
      labels: [Label.NODE_JS],
      description: 'Connecter le frontend avec le backend',
      completed: true,
    },
  ];

  getPersons(): Person[] {
    return [...this.persons];
  }

  getTodos(): Todo[] {
    return [...this.todos];
  }

  addPerson(person: Person): Person {
    const newPerson = { ...person, id: this.getNextPersonId() };
    this.persons.push(newPerson);
    return newPerson;
  }

  addTodo(todo: Todo): Todo {
    const newTodo = { ...todo, id: this.getNextTodoId() };
    this.todos.push(newTodo);
    return newTodo;
  }

  updatePerson(person: Person): Person {
    const index = this.persons.findIndex((p) => p.id === person.id);
    if (index !== -1) {
      this.persons[index] = person;
    }
    return person;
  }

  updateTodo(todo: Todo): Todo {
    const index = this.todos.findIndex((t) => t.id === todo.id);
    if (index !== -1) {
      this.todos[index] = todo;
    }
    return todo;
  }

  deletePerson(id: number): void {
    this.persons = this.persons.filter((p) => p.id !== id);
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter((t) => t.id !== id);
  }

  private getNextPersonId(): number {
    return Math.max(...this.persons.map((p) => p.id || 0)) + 1;
  }

  private getNextTodoId(): number {
    return Math.max(...this.todos.map((t) => t.id || 0)) + 1;
  }
}
