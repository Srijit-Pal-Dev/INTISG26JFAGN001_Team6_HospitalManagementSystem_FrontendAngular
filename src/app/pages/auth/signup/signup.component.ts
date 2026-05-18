import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['../auth.shared.css']
})
export class SignupComponent {

  @Input() signupForm!: FormGroup;
  @Input() isLoading = false;
  @Input() showPassword = false;

  @Output() registerSubmit = new EventEmitter<void>();
  @Output() togglePassword = new EventEmitter<void>();
  @Output() switchToLogin  = new EventEmitter<void>();

  get sf() { return this.signupForm.controls; }

  get passwordMismatch(): boolean {
    return !!this.signupForm.errors?.['passwordMismatch'] &&
           !!this.signupForm.get('confirmPassword')?.touched;
  }

  fieldError(field: string): string {
    const c = this.signupForm.get(field);
    if (!c || !c.touched || !c.errors) return '';
    if (c.errors['required'])  return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return '';
  }
}