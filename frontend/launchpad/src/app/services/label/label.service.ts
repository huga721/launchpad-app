import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { LabelModel, LabelCreate, LabelUpdate } from '../../model/label-dto';

@Injectable({ providedIn: 'root' })
export class LabelService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLabels(projectId: string): Observable<LabelModel[]> {
    return this.http.get<LabelModel[]>(`${this.apiUrl}/projects/${projectId}/labels`);
  }

  createLabel(projectId: string, body: LabelCreate): Observable<LabelModel> {
    return this.http.post<LabelModel>(`${this.apiUrl}/projects/${projectId}/labels`, body);
  }

  updateLabel(projectId: string, labelId: string, body: LabelUpdate): Observable<LabelModel> {
    return this.http.patch<LabelModel>(`${this.apiUrl}/projects/${projectId}/labels/${labelId}`, body);
  }

  deleteLabel(projectId: string, labelId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}/labels/${labelId}`);
  }
}
