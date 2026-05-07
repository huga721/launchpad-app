import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {AuthenticationService} from "../services/authentication/authentication.service";
import {Router} from "@angular/router";
import {NgIf} from "@angular/common";

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
    fullName: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  })

  errorMessage: string = '';
  loading = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  registerUser() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.registerUser({
      email: this.registerForm.value.username ?? '',
      password: this.registerForm.value.password ?? '',
      full_name: this.registerForm.value.fullName ?? '',
    }).subscribe({
      next: () => {
        this.router.navigate(['/board']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail ?? 'Błąd rejestracji. Spróbuj ponownie.';
      }
    });
  }
}
