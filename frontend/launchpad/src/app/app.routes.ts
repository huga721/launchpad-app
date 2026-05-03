import { Routes } from '@angular/router';
import {AuthenticationComponent} from "./authentication/authentication.component";
import {BoardComponent} from "./board/board.component";
import {authGuard} from "./guards/auth.guard";
import {RegisterComponent} from "./register/register.component";

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: AuthenticationComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'board', component: BoardComponent, canActivate: [authGuard]}
];
