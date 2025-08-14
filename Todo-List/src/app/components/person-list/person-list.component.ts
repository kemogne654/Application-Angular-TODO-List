import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { Person } from '../../models/person.model';
import { PersonService } from '../services/person.service';
import { PersonModalComponent } from '../person-modal/person-modal.component';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule,
  ],
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss'],
})
export class PersonListComponent implements OnInit {
  persons: Person[] = [];
  filteredPersons: Person[] = [];
  paginatedPersons: Person[] = [];
  displayedColumns: string[] = ['name', 'email', 'phone', 'actions'];

  searchText = '';

  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private personService: PersonService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPersons();
  }

  loadPersons(): void {
    this.personService.getPersons().subscribe((persons) => {
      this.persons = persons;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredPersons = this.persons.filter((person) => {
      const matchesSearch =
        !this.searchText ||
        person.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        person.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        person.phone.toLowerCase().includes(this.searchText.toLowerCase());

      return matchesSearch;
    });

    this.totalItems = this.filteredPersons.length;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPersons = this.filteredPersons.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  clearFilters(): void {
    this.searchText = '';
    this.applyFilters();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PersonModalComponent, {
      width: '600px',
      data: { person: null, isEdit: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPersons();
      }
    });
  }

  openEditDialog(person: Person): void {
    const dialogRef = this.dialog.open(PersonModalComponent, {
      width: '600px',
      data: { person: { ...person }, isEdit: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPersons();
      }
    });
  }

  deletePerson(person: Person): void {
    if (
      person.id &&
      confirm(`Êtes-vous sûr de vouloir supprimer "${person.name}" ?`)
    ) {
      this.personService.deletePerson(person.id).subscribe(() => {
        this.loadPersons();
      });
    }
  }
}
