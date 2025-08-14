import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Todo } from '../../models/todo.model';
import { Priority } from '../../models/priority.enum';
import { Label } from '../../models/label.enum';
import { TodoService } from '../services/todo.service';
import { TodoModalComponent } from '../todo-modal/todo-modal.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatChipsModule,
    MatCardModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './todo-list.component.html',
  styleUrls: [
    './todo-list.layout.scss',
    './todo-list.component.scss',
    './todo-list.mobile.scss'
  ],
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  paginatedTodos: Todo[] = [];
  displayedColumns: string[] = [
    'status',
    'titre',
    'person',
    'dates',
    'priority',
    'labels',
    'actions',
  ];

  selectedPriority: Priority | '' = '';
  selectedLabel: Label | '' = '';
  searchText = '';
  viewMode: 'table' | 'card' = 'table';

  priorities = Object.values(Priority);
  labels = Object.values(Label);

  pageSize = 6;
  pageIndex = 0;
  totalItems = 0;

  constructor(private todoService: TodoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe((todos) => {
      this.todos = todos;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredTodos = this.todos.filter((todo) => {
      const matchesSearch =
        !this.searchText ||
        todo.titre.toLowerCase().includes(this.searchText.toLowerCase()) ||
        todo.person.name
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        (todo.description &&
          todo.description
            .toLowerCase()
            .includes(this.searchText.toLowerCase()));

      const matchesPriority =
        !this.selectedPriority || todo.priority === this.selectedPriority;
      const matchesLabel =
        !this.selectedLabel || todo.labels.includes(this.selectedLabel);

      return matchesSearch && matchesPriority && matchesLabel;
    });

    this.totalItems = this.filteredTodos.length;
    this.pageIndex = 0; // Reset to first page
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTodos = this.filteredTodos.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  clearFilters(): void {
    this.selectedPriority = '';
    this.selectedLabel = '';
    this.searchText = '';
    this.pageIndex = 0;
    this.applyFilters();
  }

  changeViewMode(event: any): void {
    this.viewMode = event.value;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(TodoModalComponent, {
      width: '90vw',
      maxWidth: '800px',
      data: { todo: null, isEdit: false },
      panelClass: 'todo-modal-panel',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTodos();
      }
    });
  }

  openEditDialog(todo: Todo): void {
    const dialogRef = this.dialog.open(TodoModalComponent, {
      width: '90vw',
      maxWidth: '800px',
      data: { todo: { ...todo }, isEdit: true },
      panelClass: 'todo-modal-panel',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTodos();
      }
    });
  }

  toggleComplete(todo: Todo): void {
    if (todo.id) {
      const updatedTodo = { ...todo, completed: !todo.completed };
      this.todoService.updateTodo(updatedTodo).subscribe(() => {
        this.loadTodos();
      });
    }
  }

  deleteTodo(todo: Todo): void {
    if (
      todo.id &&
      confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${todo.titre}" ?`)
    ) {
      this.todoService.deleteTodo(todo.id).subscribe(() => {
        this.loadTodos();
      });
    }
  }

  getPriorityColor(priority: Priority): 'primary' | 'accent' | 'warn' {
    switch (priority) {
      case Priority.FACILE:
        return 'primary';
      case Priority.MOYEN:
        return 'accent';
      case Priority.DIFFICILE:
        return 'warn';
      default:
        return 'primary';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getCompletedCount(): number {
    return this.filteredTodos.filter((todo) => todo.completed).length;
  }

  getPendingCount(): number {
    return this.filteredTodos.filter((todo) => !todo.completed).length;
  }

  // Mobile pagination methods
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  nextPage(): void {
    if (this.pageIndex < this.getTotalPages() - 1) {
      this.pageIndex++;
      this.updatePaginatedData();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePaginatedData();
    }
  }
}
