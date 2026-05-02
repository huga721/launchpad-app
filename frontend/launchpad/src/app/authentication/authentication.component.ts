import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { AuthRequest } from '../model/authentication-dto';
import {Router} from "@angular/router";
import {routes} from "../app.routes";

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(
  private authenticationService: AuthenticationService,
  private router: Router) {}

  authenticateUser() {
    const authRequest: AuthRequest = {
      email: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? ''
    };

    this.authenticationService.authenticateUser(authRequest).subscribe({
      next: (result) => {
        console.log('Authenticated user ' + result.access_token);
        this.router.navigate(['/board'])
      },
      error: (err) => {
        console.error('Failed authentication ' + err);
      }
    });
  }
}
