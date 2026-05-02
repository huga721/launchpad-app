import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthenticationService} from "../../services/authentication/authentication.service";

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService)
  const token = authService.getAccessToken()

  if (token) {
    console.log(`Trying to authorize request ${req} with ${token}`)
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    })
    return next(clonedRequest)
  }

  console.warn("Token DNE")
  return next(req);
};
