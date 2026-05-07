import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TaskCreate, TaskModel, TaskStatusUpdate } from '../../model/task-dto';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTasks(projectId: string, statusFilter?: string): Observable<TaskModel[]> {
    let params = new HttpParams();
    if (statusFilter) params = params.set('status_filter', statusFilter);
    return this.http.get<TaskModel[]>(`${this.apiUrl}/projects/${projectId}/tasks`, { params });
  }

  createTask(projectId: string, body: TaskCreate): Observable<TaskModel> {
    return this.http.post<TaskModel>(`${this.apiUrl}/projects/${projectId}/tasks`, body);
  }

  updateTaskStatus(projectId: string, taskId: string, body: TaskStatusUpdate): Observable<TaskModel> {
    return this.http.patch<TaskModel>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}/status`, body);
  }

  deleteTask(projectId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}`);
  }
}
