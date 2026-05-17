import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

export type LoginStep = 'login' | 'forgot' | 'otp' | 'reset';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  step: LoginStep = 'login';

  forgotEmail    = '';
  otpValue       = '';
  resetToken     = '';
  newPassword    = '';
  confirmNew     = '';
  showNewPw      = false;
  fpLoading      = false;
  fpError        = '';
  fpSuccess      = '';

  constructor(private authService: AuthService) {}

  get lf() { return this.loginForm.controls; }

  fieldError(field: string): string {
    const c = this.loginForm.get(field);
    if (!c || !c.touched || !c.errors) return '';
    if (c.errors['required'])  return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return '';
  }

  goToForgot() {
    this.step       = 'forgot';
    this.fpError    = '';
    this.fpSuccess  = '';
    this.forgotEmail = '';
  }

  backToLogin() {
    this.step      = 'login';
    this.fpError   = '';
    this.fpSuccess = '';
  }

  submitForgot() {
    this.fpError   = '';
    this.fpSuccess = '';
    if (!this.forgotEmail.trim()) {
      this.fpError = 'Please enter your email.';
      return;
    }
    this.fpLoading = true;
    this.authService.forgotPassword(this.forgotEmail.trim()).subscribe({
      next: () => {
        this.fpLoading = false;
        this.step      = 'otp';
      },
      error: (err) => {
        this.fpLoading = false;
        this.fpError   = err?.error?.message || 'No account found with that email.';
      }
    });
  }

  submitOtp() {
    this.fpError   = '';
    this.fpSuccess = '';
    if (!this.otpValue.trim()) {
      this.fpError = 'Please enter the OTP.';
      return;
    }
    this.fpLoading = true;
    this.authService.verifyOtp(this.forgotEmail.trim(), this.otpValue.trim()).subscribe({
      next: (res) => {
        this.fpLoading  = false;
        this.resetToken = res.resetToken;
        this.step       = 'reset';
      },
      error: (err) => {
        this.fpLoading = false;
        this.fpError   = err?.error?.message || 'Invalid or expired OTP.';
      }
    });
  }

  submitReset() {
    this.fpError   = '';
    this.fpSuccess = '';
    if (!this.newPassword || this.newPassword.length < 6) {
      this.fpError = 'Password must be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmNew) {
      this.fpError = 'Passwords do not match.';
      return;
    }
    this.fpLoading = true;
    this.authService.resetPassword(this.resetToken, this.newPassword).subscribe({
      next: () => {
        this.fpLoading  = false;
        this.fpSuccess  = 'Password reset successfully. You can now sign in.';
        setTimeout(() => this.backToLogin(), 1500);
      },
      error: (err) => {
        this.fpLoading = false;
        this.fpError   = err?.error?.message || 'Failed to reset password.';
      }
    });
  }

  resendOtp() {
    this.fpError   = '';
    this.fpSuccess = '';
    this.fpLoading = true;
    this.authService.forgotPassword(this.forgotEmail.trim()).subscribe({
      next: () => {
        this.fpLoading = false;
        this.fpSuccess = 'OTP resent successfully.';
      },
      error: (err) => {
        this.fpLoading = false;
        this.fpError   = err?.error?.message || 'Failed to resend OTP.';
      }
    });
  }
}