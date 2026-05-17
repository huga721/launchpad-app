import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AuthRequest, AuthResponse, RegisterRequest} from "../../model/authentication-dto";
import { Observable, tap } from "rxjs";
import {UserResponse} from "../../model/admin-dto";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private apiUrl = environment.apiUrl;
  private readonly accessTokenStorageKey = 'launchpad_access_token';
  private accessToken: string = '';

  constructor(private httpClient: HttpClient) {
    if (typeof window !== 'undefined') {
      this.accessToken = window.localStorage.getItem(this.accessTokenStorageKey) ?? '';
    }
  }

  authenticateUser(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/auth/login`, authRequest)
      .pipe(
        tap(response => this.setAccessToken(response.access_token))
      );
  }

  registerUser(request: RegisterRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => this.setAccessToken(response.access_token))
      );
  }

  getMe(): Observable<UserResponse> {
    return this.httpClient.get<UserResponse>(`${this.apiUrl}/auth/me`);
  }

  getAccessToken(): string {
    return this.accessToken
  }

  logout(): void {
    this.accessToken = '';
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.accessTokenStorageKey);
    }
  }

  private setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.accessTokenStorageKey, token);
    }
  }
}
