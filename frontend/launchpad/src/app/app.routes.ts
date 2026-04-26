import { Routes } from '@angular/router';
import {AuthenticationComponent} from "./authentication/authentication.component";
import {BoardComponent} from "./board/board.component";

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: AuthenticationComponent},
  {path: 'board', component: BoardComponent}
];
