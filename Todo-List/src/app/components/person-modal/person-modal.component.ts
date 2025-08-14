import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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
import { Person } from '../../models/person.model';
import { PersonService } from '../services/person.service';

@Component({
  selector: 'app-person-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './person-modal.component.html',
  styleUrls: ['./person-modal.component.scss'],
})
export class PersonModalComponent implements OnInit {
  personForm: FormGroup;
  isEdit: boolean;
  person: Person | null;
  existingPersons: Person[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PersonModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { person: Person | null; isEdit: boolean },
    private personService: PersonService
  ) {
    this.isEdit = data.isEdit;
    this.person = data.person;

    this.personForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.minLength(3), this.trimValidator],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    this.loadExistingPersons();
    if (this.isEdit && this.person) {
      this.populateForm();
    }
  }

  trimValidator(control: any) {
    if (control.value && control.value.trim().length < 3) {
      return { minlength: true };
    }
    return null;
  }

  loadExistingPersons(): void {
    this.personService.getPersons().subscribe((persons) => {
      this.existingPersons = persons;
      this.addUniqueNameValidator();
    });
  }

  addUniqueNameValidator(): void {
    const nameControl = this.personForm.get('name');
    if (nameControl) {
      nameControl.setValidators([
        Validators.required,
        Validators.minLength(3),
        this.trimValidator,
        this.uniqueNameValidator.bind(this),
      ]);
      nameControl.updateValueAndValidity();
    }
  }

  uniqueNameValidator(control: any) {
    if (!control.value) return null;

    const trimmedName = control.value.trim().toLowerCase();
    const isDuplicate = this.existingPersons.some((person) => {
      const isDifferentPerson = !this.person || person.id !== this.person.id;
      return isDifferentPerson && person.name.toLowerCase() === trimmedName;
    });

    return isDuplicate ? { uniqueName: true } : null;
  }

  populateForm(): void {
    if (this.person) {
      this.personForm.patchValue({
        name: this.person.name,
        email: this.person.email,
        phone: this.person.phone,
      });
    }
  }

  onSave(): void {
    if (this.personForm.valid) {
      const formValue = this.personForm.value;

      const personData: Person = {
        name: formValue.name.trim(),
        email: formValue.email.trim(),
        phone: formValue.phone.trim(),
      };

      if (this.isEdit && this.person?.id) {
        personData.id = this.person.id;
        this.personService.updatePerson(personData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.personService.addPerson(personData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  markFormGroupTouched(): void {
    Object.keys(this.personForm.controls).forEach((key) => {
      const control = this.personForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.personForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(
          fieldName
        )} doit avoir au moins 3 caractères`;
      }
      if (control.errors['email']) {
        return "L'adresse email n'est pas valide";
      }
      if (control.errors['uniqueName']) {
        return 'Ce nom existe déjà';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Le nom',
      email: "L'email",
      phone: 'Le téléphone',
    };
    return labels[fieldName] || fieldName;
  }
}
