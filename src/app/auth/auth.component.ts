import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { LoginRequest, RegisterRequest } from '../core/models/index';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  activeTab = signal<'login' | 'signup'>('login');

  loginForm: LoginRequest = {
    username: '',
    password: ''
  };

  signupForm: RegisterRequest & { confirmPassword: string } = {
    username: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  };

  showLoginPassword = false;
  showSignupPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private readonly ROLE_REDIRECT_MAP: Record<string, string> = {
    'ADMIN': '/dashboard',
    'DOCTOR': '/doctor-dashboard',
    'PHARMACIST': '/pharmacy-dashboard',
    'LAB_TECHNICIAN': '/lab-dashboard',
    'USER': '/patient-dashboard'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getRole());
    }
  }

  switchTab(tab: 'login' | 'signup') {
    this.activeTab.set(tab);
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleSignupPassword() {
    this.showSignupPassword = !this.showSignupPassword;
  }

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginForm.username || !this.loginForm.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm).subscribe({
      next: (response) => {
        this.isLoading = false;
        const role = this.authService.getRole();
        this.redirectByRole(role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Invalid username or password.';
      }
    });
  }

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.signupForm.username || !this.signupForm.password ||
      !this.signupForm.fullName || !this.signupForm.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.signupForm.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;

    const request: RegisterRequest = {
      username: this.signupForm.username,
      password: this.signupForm.password,
      fullName: this.signupForm.fullName
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          response.message || 'Account created! You can now sign in.';
        setTimeout(() => this.switchTab('login'), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  private redirectByRole(role: string | null) {
    if (!role) {
      this.errorMessage = 'Unable to determine user role.';
      this.authService.clearSession();
      return;
    }

    const route = this.ROLE_REDIRECT_MAP[role];

    if (route) {
      this.router.navigate([route]).then(() => window.location.reload());
    } else {
      this.errorMessage = `No dashboard available for role: ${role}`;
      this.authService.clearSession();
    }
  }
}