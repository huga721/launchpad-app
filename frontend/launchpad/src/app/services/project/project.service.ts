import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateProjectRequest, ProjectModel, MemberModel } from '../../model/project-dto';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  private apiUrl = environment.apiUrl;
  private projectSource = new BehaviorSubject<ProjectModel | null>(null);
  activeProject$ = this.projectSource.asObservable();

  constructor(private httpClient: HttpClient) {}

  createProject(request: CreateProjectRequest): Observable<ProjectModel> {
    return this.httpClient.post<ProjectModel>(`${this.apiUrl}/projects`, request);
  }

  setActiveProject(project: ProjectModel): void {
    this.projectSource.next(project);
  }

  getProjects(): Observable<ProjectModel[]> {
    return this.httpClient.get<ProjectModel[]>(`${this.apiUrl}/projects`);
  }

  getMembers(projectId: string): Observable<MemberModel[]> {
    return this.httpClient.get<MemberModel[]>(`${this.apiUrl}/projects/${projectId}/members`);
  }

  addMember(projectId: string, userId: string, role: string): Observable<MemberModel> {
    return this.httpClient.post<MemberModel>(`${this.apiUrl}/projects/${projectId}/members`, { user_id: userId, role });
  }

  removeMember(projectId: string, userId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/projects/${projectId}/members/${userId}`);
  }

  updateMemberRole(projectId: string, userId: string, role: string): Observable<MemberModel> {
    return this.httpClient.patch<MemberModel>(`${this.apiUrl}/projects/${projectId}/members/${userId}`, { role });
  }
}
