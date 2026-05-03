import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink
    ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm = new FormGroup({
    fullName: new FormControl(''),
    username: new FormControl(''),
    password: new FormControl('')
  })

  constructor() {}

  registerUser() {

  }
}
