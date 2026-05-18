// import { Component, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
// import { LoginRequest, RegisterRequest } from '../../core/models/index';

// export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
//   const password        = group.get('password')?.value;
//   const confirmPassword = group.get('confirmPassword')?.value;
//   return password === confirmPassword ? null : { passwordMismatch: true };
// }

// @Component({
//   selector: 'app-auth',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './auth.component.html',
//   styleUrls: ['./auth.component.css']
// })
// export class AuthComponent implements OnInit {

//   activeTab = signal<'login' | 'signup'>('login');

//   loginForm!: FormGroup;
//   signupForm!: FormGroup;

//   isLoading     = false;
//   errorMessage  = '';
//   successMessage = '';
//   showLoginPassword  = false;
//   showSignupPassword = false;

//   toggleLoginPassword()  { this.showLoginPassword  = !this.showLoginPassword;  }
//   toggleSignupPassword() { this.showSignupPassword = !this.showSignupPassword; }

//   private readonly ROLE_REDIRECT_MAP: Record<string, string> = {
//     'ADMIN':          '/dashboard',
//     'DOCTOR':         '/doctor-dashboard',
//     'PHARMACIST':     '/pharmacy-dashboard',
//     'LAB_TECHNICIAN': '/lab-dashboard',
//     'USER':           '/patient-dashboard'
//   };

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       username: ['', [Validators.required, Validators.minLength(3)]],
//       password: ['', [Validators.required, Validators.minLength(6)]]
//     });

//     this.signupForm = this.fb.group({
//       fullName:        ['', [Validators.required, Validators.minLength(2)]],
//       username:        ['', [Validators.required, Validators.minLength(3)]],
//       password:        ['', [Validators.required, Validators.minLength(6)]],
//       confirmPassword: ['',  Validators.required]
//     }, { validators: passwordMatchValidator });

//     if (this.authService.isLoggedIn()) {
//       this.redirectByRole(this.authService.getRole());
//     }
//   }

//   switchTab(tab: 'login' | 'signup') {
//     this.activeTab.set(tab);
//     this.errorMessage  = '';
//     this.successMessage = '';
//     this.loginForm.reset();
//     this.signupForm.reset();
//   }

//   goHome() {
//     this.router.navigate(['']);
//   }

//   get lf() { return this.loginForm.controls; }
//   get sf() { return this.signupForm.controls; }

//   loginFieldError(field: string): string {
//     const c = this.loginForm.get(field);
//     if (!c || !c.touched || !c.errors) return '';
//     if (c.errors['required'])  return 'This field is required.';
//     if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
//     return '';
//   }

//   signupFieldError(field: string): string {
//     const c = this.signupForm.get(field);
//     if (!c || !c.touched || !c.errors) return '';
//     if (c.errors['required'])  return 'This field is required.';
//     if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
//     return '';
//   }

//   get passwordMismatch(): boolean {
//     return !!this.signupForm.errors?.['passwordMismatch'] &&
//            !!this.signupForm.get('confirmPassword')?.touched;
//   }

//   onLogin() {
//     this.errorMessage  = '';
//     this.successMessage = '';
//     this.loginForm.markAllAsTouched();
//     if (this.loginForm.invalid) return;

//     this.isLoading = true;

//     const request: LoginRequest = {
//       username: this.loginForm.value.username.trim(),
//       password: this.loginForm.value.password
//     };

//     this.authService.login(request).subscribe({
//       next: () => {
//         this.isLoading = false;
//         this.redirectByRole(this.authService.getRole());
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.errorMessage = err?.error?.message || 'Invalid username or password.';
//       }
//     });
//   }

//   onRegister() {
//     this.errorMessage  = '';
//     this.successMessage = '';
//     this.signupForm.markAllAsTouched();
//     if (this.signupForm.invalid) return;

//     this.isLoading = true;

//     const request: RegisterRequest = {
//       username: this.signupForm.value.username.trim(),
//       password: this.signupForm.value.password,
//       fullName: this.signupForm.value.fullName.trim()
//     };

//     this.authService.register(request).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         this.successMessage = response.message || 'Account created! You can now sign in.';
//         setTimeout(() => this.switchTab('login'), 2000);
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
//       }
//     });
//   }

//   private redirectByRole(role: string | null) {
//     if (!role) {
//       this.errorMessage = 'Unable to determine user role.';
//       this.authService.clearSession();
//       return;
//     }
//     const route = this.ROLE_REDIRECT_MAP[role];
//     if (route) {
//       this.router.navigate([route]);
//     } else {
//       this.errorMessage = `No dashboard available for role: ${role}`;
//       this.authService.clearSession();
//     }
//   }
// }

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest, RegisterRequest } from '../../core/models/index';
import { HeroComponent } from './hero/hero.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password        = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, HeroComponent, LoginComponent, SignupComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  activeTab = signal<'login' | 'signup'>('login');

  loginForm!: FormGroup;
  signupForm!: FormGroup;

  isLoading      = false;
  errorMessage   = '';
  successMessage = '';
  showLoginPassword  = false;
  showSignupPassword = false;

  private readonly ROLE_REDIRECT_MAP: Record<string, string> = {
    'ADMIN':          '/dashboard',
    'DOCTOR':         '/doctor-dashboard',
    'PHARMACIST':     '/pharmacy-dashboard',
    'LAB_TECHNICIAN': '/lab-dashboard',
    'USER':           '/patient-dashboard'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(4)]],
      username:        ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['',  Validators.required]
    }, { validators: passwordMatchValidator });

    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getRole());
    }
  }

  switchTab(tab: 'login' | 'signup') {
    this.activeTab.set(tab);
    this.errorMessage   = '';
    this.successMessage = '';
    this.loginForm.reset();
    this.signupForm.reset();
  }

  goHome() {
    this.router.navigate(['']);
  }

  onLogin() {
    this.errorMessage   = '';
    this.successMessage = '';
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    const request: LoginRequest = {
      username: this.loginForm.value.username.trim(),
      password: this.loginForm.value.password
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.redirectByRole(this.authService.getRole());
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid username or password.';
      }
    });
  }

  onRegister() {
    this.errorMessage   = '';
    this.successMessage = '';
    this.signupForm.markAllAsTouched();
    if (this.signupForm.invalid) return;

    this.isLoading = true;

    const request: RegisterRequest = {
      username: this.signupForm.value.username.trim(),
      password: this.signupForm.value.password,
      fullName: this.signupForm.value.fullName.trim()
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Account created! You can now sign in.';
        setTimeout(() => this.switchTab('login'), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
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
      this.router.navigate([route]);
    } else {
      this.errorMessage = `No dashboard available for role: ${role}`;
      this.authService.clearSession();
    }
  }
}