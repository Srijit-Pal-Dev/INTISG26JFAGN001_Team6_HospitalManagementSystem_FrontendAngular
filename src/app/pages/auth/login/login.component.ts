import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['../auth.shared.css']
})
export class LoginComponent {

  @Input() loginForm!: FormGroup;
  @Input() isLoading = false;
  @Input() showPassword = false;

  @Output() loginSubmit    = new EventEmitter<void>();
  @Output() togglePassword = new EventEmitter<void>();
  @Output() switchToSignup = new EventEmitter<void>();

  get lf() { return this.loginForm.controls; }

  fieldError(field: string): string {
    const c = this.loginForm.get(field);
    if (!c || !c.touched || !c.errors) return '';
    if (c.errors['required'])  return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return '';
  }
}