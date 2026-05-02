import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AuthRequest, AuthResponse} from "../../model/authentication-dto";
import { Observable, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private apiUrl = environment.apiUrl;
  private accessToken: string = "";

  constructor(private httpClient: HttpClient) { }

  authenticateUser(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/auth/login`, authRequest)
      .pipe(
        tap(response => this.accessToken = response.access_token)
      );
  }

  getAccessToken(): string {
    return this.accessToken
  }
}
