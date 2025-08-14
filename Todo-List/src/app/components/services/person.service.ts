import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Person } from '../../models/person.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(private mockDataService: MockDataService) {}

  getPersons(): Observable<Person[]> {
    return of(this.mockDataService.getPersons());
  }

  addPerson(person: Person): Observable<Person> {
    return of(this.mockDataService.addPerson(person));
  }

  updatePerson(person: Person): Observable<Person> {
    return of(this.mockDataService.updatePerson(person));
  }

  deletePerson(id: number): Observable<void> {
    this.mockDataService.deletePerson(id);
    return of();
  }

  searchPersons(query: string): Observable<Person[]> {
    const persons = this.mockDataService.getPersons();
    const filtered = persons.filter(
      (person) =>
        person.name.toLowerCase().includes(query.toLowerCase()) ||
        person.email.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }
}
