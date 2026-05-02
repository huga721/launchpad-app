import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthenticationService} from "../services/authentication/authentication.service";
import {AuthenticationComponent} from "../authentication/authentication.component";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService)
  const router = inject(Router)
  const token = authService.getAccessToken()

  console.log('Token ', token)

  if (token != null && token != '') {
    return true;
  }

  return router.createUrlTree(['/login'])
};
