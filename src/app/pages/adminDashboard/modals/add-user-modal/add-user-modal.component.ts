import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RoleName, CreateUserRequest } from '../../../../core/models/index';

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password        = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['../../adminDashboard.shared.css']
})
export class AddUserModalComponent implements OnInit {

  @Input() show = false;
  @Input() isSubmitting = false;
  @Input() addError = '';

  @Output() closed      = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<CreateUserRequest>();

  addUserForm!: FormGroup;
  selectedRole: RoleName = RoleName.DOCTOR;
  showAddPassword = false;
  RoleName = RoleName;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.addUserForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(2)]],
      username:        ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['',  Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get af() { return this.addUserForm.controls; }

  get addPasswordMismatch(): boolean {
    return !!this.addUserForm.errors?.['passwordMismatch'] &&
           !!this.addUserForm.get('confirmPassword')?.touched;
  }

  fieldError(field: string): string {
    const c = this.addUserForm.get(field);
    if (!c || !c.touched || !c.errors) return '';
    if (c.errors['required'])  return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return '';
  }

  selectRole(role: RoleName) { this.selectedRole = role; }

  toggleAddPassword() { this.showAddPassword = !this.showAddPassword; }

  submit() {
    this.addUserForm.markAllAsTouched();
    if (this.addUserForm.invalid) return;
    this.userCreated.emit({
      fullName: this.addUserForm.value.fullName.trim(),
      username: this.addUserForm.value.username.trim(),
      password: this.addUserForm.value.password,
      roles:    [this.selectedRole]
    });
  }

  close() {
    this.addUserForm.reset();
    this.addUserForm.markAsUntouched();
    this.addUserForm.markAsPristine();
    this.selectedRole    = RoleName.DOCTOR;
    this.showAddPassword = false;
    this.closed.emit();
  }
}