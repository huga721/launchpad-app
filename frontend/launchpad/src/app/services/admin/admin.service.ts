import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../../model/admin-dto';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getUsers(): Observable<UserResponse[]> {
    return this.httpClient.get<UserResponse[]>(`${this.apiUrl}/admin/users`);
  }

  createUser(data: {
    full_name: string;
    email: string;
    password: string;
    role: string;
  }): Observable<UserResponse> {
    return this.httpClient.post<UserResponse>(`${this.apiUrl}/admin/users`, data);
  }

  updateUser(userId: string, data: { password?: string }): Observable<UserResponse> {
    return this.httpClient.put<UserResponse>(`${this.apiUrl}/admin/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/admin/users/${userId}`);
  }
}

