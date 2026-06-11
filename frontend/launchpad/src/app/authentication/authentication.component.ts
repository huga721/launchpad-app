import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { AuthRequest } from '../model/authentication-dto';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  errorMsg = '';

  constructor(
  private authenticationService: AuthenticationService,
  private router: Router) {}

  authenticateUser() {
    const authRequest: AuthRequest = {
      email: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? ''
    };

    this.errorMsg = '';
    this.authenticationService.authenticateUser(authRequest).subscribe({
      next: () => { this.router.navigate(['/board']); },
      error: (err) => {
        if (err.status === 422) {
          this.errorMsg = 'Invalid email or password.';
        } else {
          this.errorMsg = err.error?.detail ?? 'Login failed.';
        }
      }
    });
  }
}
