import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TaskCreate, TaskModel, TaskStatusUpdate, TaskUpdate, TaskFilters } from '../../model/task-dto';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTasks(projectId: string, filters?: TaskFilters): Observable<TaskModel[]> {
    let params = new HttpParams();
    if (filters?.status_filter) params = params.set('status_filter', filters.status_filter);
    if (filters?.priority)      params = params.set('priority', filters.priority);
    if (filters?.assignee_id)   params = params.set('assignee_id', filters.assignee_id);
    if (filters?.label_id)      params = params.set('label_id', filters.label_id);
    if (filters?.only_my)       params = params.set('only_my', 'true');
    return this.http.get<TaskModel[]>(`${this.apiUrl}/projects/${projectId}/tasks`, { params });
  }

  createTask(projectId: string, body: TaskCreate): Observable<TaskModel> {
    return this.http.post<TaskModel>(`${this.apiUrl}/projects/${projectId}/tasks`, body);
  }

  updateTask(projectId: string, taskId: string, body: TaskUpdate): Observable<TaskModel> {
    return this.http.patch<TaskModel>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}`, body);
  }

  updateTaskStatus(projectId: string, taskId: string, body: TaskStatusUpdate): Observable<TaskModel> {
    return this.http.patch<TaskModel>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}/status`, body);
  }

  deleteTask(projectId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}`);
  }
}
