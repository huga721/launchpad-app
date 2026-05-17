import { Component } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {AuthenticationService} from "../services/authentication/authentication.service";
import {Router} from "@angular/router";
import {NgIf} from "@angular/common";

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value ?? '';
  const confirmPassword = control.get('confirmPassword')?.value ?? '';

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator })

  errorMessage: string = '';
  successMessage: string = '';
  loading = false;
  submitted = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  registerUser() {
    this.submitted = true;
    this.registerForm.markAllAsTouched();
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.errorMessage = 'Popraw zaznaczone pola i spróbuj ponownie.';
      return;
    }

    this.loading = true;

    this.authService.registerUser({
      email: (this.registerForm.value.username ?? '').trim().toLowerCase(),
      password: this.registerForm.value.password ?? '',
      full_name: (this.registerForm.value.fullName ?? '').trim(),
    }).subscribe({
      next: () => {
        this.successMessage = 'Konto zostało utworzone. Trwa przekierowanie...';
        this.router.navigate(['/board']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail ?? 'Błąd rejestracji. Spróbuj ponownie.';
      }
    });
  }

  hasControlError(controlName: 'fullName' | 'username' | 'password' | 'confirmPassword'): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  getControlError(controlName: 'fullName' | 'username' | 'password' | 'confirmPassword'): string {
    const control = this.registerForm.get(controlName);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'To pole jest wymagane.';
    }

    if (control.errors['email']) {
      return 'Podaj poprawny adres e-mail.';
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Wymagane minimum ${requiredLength} znaki.`;
    }

    return 'Nieprawidłowa wartość.';
  }

  get passwordMismatch(): boolean {
    return !!this.registerForm.errors?.['passwordMismatch']
      && ((this.registerForm.get('confirmPassword')?.touched ?? false) || this.submitted);
  }
}
