import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CreateProjectRequest, ProjectModel} from "../../model/project-dto";
import {environment} from "../../../environments/environment.development";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = environment.apiUrl

  private projectSource = new BehaviorSubject<ProjectModel | null>(null)
  activeProject$ = this.projectSource.asObservable()

  constructor(private httpClient: HttpClient) { }

  createProject(request: CreateProjectRequest) {
    return this.httpClient.post<ProjectModel>(`${this.apiUrl}/projects`, request);
  }

  setActiveProject(project: ProjectModel) {
    this.projectSource.next(project);
  }

  getProjects(): Observable<ProjectModel[]> {
    return this.httpClient.get<ProjectModel[]>(`${this.apiUrl}/projects`)
  }
}
