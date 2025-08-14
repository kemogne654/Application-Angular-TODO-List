import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Todo } from '../../models/todo.model';
import { Person } from '../../models/person.model';
import { Priority } from '../../models/priority.enum';
import { Label } from '../../models/label.enum';
import { TodoService } from '../services/todo.service';
import { PersonService } from '../services/person.service';

@Component({
  selector: 'app-todo-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCheckboxModule,
  ],
  templateUrl: './todo-modal.component.html',
  styleUrls: ['./todo-modal.component.scss'],
})
export class TodoModalComponent implements OnInit {
  todoForm: FormGroup;
  isEdit: boolean;
  todo: Todo | null;
  isSaving = false;

  availablePersons: Person[] = [];
  priorities = Object.values(Priority);
  availableLabels = Object.values(Label);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TodoModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { todo: Todo | null; isEdit: boolean },
    private todoService: TodoService,
    private personService: PersonService
  ) {
    this.isEdit = data.isEdit;
    this.todo = data.todo;

    this.todoForm = this.fb.group({
      titre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          this.trimValidator,
        ],
      ],
      description: ['', [Validators.maxLength(500)]],
      personId: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      priority: ['', [Validators.required]],
      labels: [[], [Validators.required, this.minArrayLengthValidator(1)]],
      completed: [false],
    });

    // Add end date validator after form creation
    this.todoForm
      .get('endDate')
      ?.setValidators([this.endDateValidator.bind(this)]);
  }

  ngOnInit(): void {
    this.loadPersons();

    if (this.isEdit && this.todo) {
      this.populateForm();
    }
  }

  // Custom Validators
  trimValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length < 3) {
      return {
        minlength: {
          requiredLength: 3,
          actualLength: control.value.trim().length,
        },
      };
    }
    return null;
  }

  minArrayLengthValidator(minLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (
        !control.value ||
        !Array.isArray(control.value) ||
        control.value.length < minLength
      ) {
        return {
          minArrayLength: {
            requiredLength: minLength,
            actualLength: control.value?.length || 0,
          },
        };
      }
      return null;
    };
  }

  endDateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = this.todoForm?.get('startDate')?.value;
    const endDate = control.value;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return { endDateInvalid: true };
    }
    return null;
  }

  loadPersons(): void {
    this.personService.getPersons().subscribe((persons) => {
      this.availablePersons = persons;
    });
  }

  populateForm(): void {
    if (this.todo) {
      this.todoForm.patchValue({
        titre: this.todo.titre,
        description: this.todo.description || '',
        personId: this.todo.person.id,
        startDate: this.todo.startDate,
        endDate: this.todo.endDate || '',
        priority: this.todo.priority,
        labels: [...this.todo.labels],
        completed: this.todo.completed || false,
      });
    }
  }

  onSave(): void {
    if (this.todoForm.valid && !this.isSaving) {
      this.isSaving = true;
      const formValue = this.todoForm.value;

      // Find the selected person
      const selectedPerson = this.availablePersons.find(
        (person) => person.id === formValue.personId
      );

      if (!selectedPerson) {
        this.isSaving = false;
        return;
      }

      const todoData: Todo = {
        titre: formValue.titre.trim(),
        description: formValue.description.trim(),
        person: selectedPerson,
        startDate: new Date(formValue.startDate),
        endDate: formValue.endDate ? new Date(formValue.endDate) : undefined,
        priority: formValue.priority,
        labels: [...formValue.labels],
        completed: formValue.completed || false,
      };

      const saveOperation =
        this.isEdit && this.todo?.id
          ? this.todoService.updateTodo({ ...todoData, id: this.todo.id })
          : this.todoService.addTodo(todoData);

      saveOperation.subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error saving todo:', error);
          // You could add a snackbar or error message here
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  resetForm(): void {
    if (this.isEdit && this.todo) {
      this.populateForm();
    } else {
      this.todoForm.reset({
        titre: '',
        description: '',
        personId: '',
        startDate: '',
        endDate: '',
        priority: '',
        labels: [],
        completed: false,
      });
    }
    this.markFormGroupUntouched();
  }

  removeLabel(labelToRemove: Label): void {
    const currentLabels = this.todoForm.get('labels')?.value || [];
    const updatedLabels = currentLabels.filter(
      (label: Label) => label !== labelToRemove
    );
    this.todoForm.patchValue({ labels: updatedLabels });
  }

  markFormGroupTouched(): void {
    Object.keys(this.todoForm.controls).forEach((key) => {
      const control = this.todoForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  markFormGroupUntouched(): void {
    Object.keys(this.todoForm.controls).forEach((key) => {
      const control = this.todoForm.get(key);
      control?.markAsUntouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.todoForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(
          fieldName
        )} doit avoir au moins ${requiredLength} caractères`;
      }
      if (control.errors['maxlength']) {
        const maxLength = control.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(
          fieldName
        )} ne peut pas dépasser ${maxLength} caractères`;
      }
      if (control.errors['minArrayLength']) {
        return 'Sélectionnez au moins une technologie';
      }
      if (control.errors['endDateInvalid']) {
        return 'La date de fin doit être postérieure à la date de début';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      titre: 'Le titre',
      description: 'La description',
      personId: 'La personne assignée',
      startDate: 'La date de début',
      endDate: 'La date de fin',
      priority: 'La priorité',
      labels: 'Les technologies',
    };
    return labels[fieldName] || fieldName;
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
}
