import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { AuthenticationService } from './authentication.service';
import { environment } from '../../../environments/environment';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store access token', () => {
    const authRequest = { email: 'test@example.com', password: 'secret' };
    const mockResponse = { access_token: 'test-token', token_type: 'bearer' };

    service.authenticateUser(authRequest).subscribe((response) => {
      expect(response.access_token).toBe('test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(authRequest);
    req.flush(mockResponse);
  });

  it('should logout and clear token', () => {
    localStorage.setItem('launchpad_access_token', 'stored-token');

    const freshService = TestBed.inject(AuthenticationService);
    freshService.logout();

    expect(freshService.getAccessToken()).toBe('');
    expect(localStorage.getItem('launchpad_access_token')).toBeNull();
  });
});
