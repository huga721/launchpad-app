import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthenticationService } from '../services/authentication/authentication.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthenticationService>;
  let router: jasmine.SpyObj<Router>;

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthenticationService', ['getAccessToken']);
    router = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow access when token exists', () => {
    authService.getAccessToken.and.returnValue('valid-token');

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBeTrue();
  });

  it('should redirect to login when token is missing', () => {
    authService.getAccessToken.and.returnValue('');
    const loginUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(loginUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginUrlTree);
  });
});
