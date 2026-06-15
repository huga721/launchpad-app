// @ts-ignore
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// @ts-ignore
import { NgForOf, NgIf } from '@angular/common';
import { ProjectService } from '../services/project/project.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { CreateProjectRequest, ProjectModel } from '../model/project-dto';

@Component({
  selector: 'app-project-sidebar',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './project-sidebar.component.html',
  styleUrls: ['./project-sidebar.component.css']
})
export class ProjectSidebarComponent implements OnInit {

  @Output() sidebarClose = new EventEmitter<void>();
  @Output() selectedProject = new EventEmitter<ProjectModel>();

  showCreateModal = false;
  showEditModal   = false;
  showDeleteModal = false;

  activeProjectId: string | null = null;
  isAdmin = false;

  projects: ProjectModel[] = [];
  editingProject: ProjectModel | null = null;
  deletingProject: ProjectModel | null = null;

  createProjectForm = new FormGroup({
    projectName:        new FormControl('', [Validators.required]),
    projectDescription: new FormControl('')
  });

  editProjectForm = new FormGroup({
    projectName:        new FormControl('', [Validators.required]),
    projectDescription: new FormControl('')
  });

  constructor(
    private projectService: ProjectService,
    private authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects()
      .subscribe(data => this.projects = data);

    this.projectService.activeProject$
      .subscribe(project => this.activeProjectId = project?.id ?? null);

    this.authService.getMe().subscribe({
      next: user => this.isAdmin = user.role === 'admin',
      error: () => this.isAdmin = false,
    });
  }

  closeSidebar(): void {
    this.sidebarClose.emit();
  }

  selectProject(project: ProjectModel): void {
    this.projectService.setActiveProject(project);
    this.selectedProject.emit(project);
    this.activeProjectId = project.id;
  }

  openCreateModal(): void {
    this.createProjectForm.reset({ projectName: '', projectDescription: '' });
    this.showCreateModal = true;
  }

  addProject(): void {
    if (this.createProjectForm.invalid) return;

    const req: CreateProjectRequest = {
      name:        (this.createProjectForm.value.projectName ?? '').trim(),
      description: this.createProjectForm.value.projectDescription ?? ''
    };
    if (!req.name) return;

    this.projectService.createProject(req).subscribe({
      next: (result) => {
        this.projects = [result, ...this.projects];
        this.createProjectForm.reset({ projectName: '', projectDescription: '' });
        this.showCreateModal = false;
      },
      error: (err) => console.error('Błąd tworzenia projektu', err)
    });
  }

  openEditModal(event: MouseEvent, project: ProjectModel): void {
    event.stopPropagation();
    this.editingProject = project;
    this.editProjectForm.reset({
      projectName:        project.name,
      projectDescription: project.description ?? ''
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingProject = null;
  }

  submitEditProject(): void {
    if (!this.editingProject || this.editProjectForm.invalid) return;

    const data = {
      name:        (this.editProjectForm.value.projectName ?? '').trim(),
      description: this.editProjectForm.value.projectDescription ?? ''
    };

    this.projectService.updateProject(this.editingProject.id, data).subscribe({
      next: (updated) => {
        this.projects = this.projects.map(p => p.id === updated.id ? updated : p);
        if (this.activeProjectId === updated.id) {
          this.projectService.setActiveProject(updated);
        }
        this.closeEditModal();
      },
      error: (err) => console.error('Błąd edycji projektu', err)
    });
  }

  openDeleteModal(event: MouseEvent, project: ProjectModel): void {
    event.stopPropagation();
    this.deletingProject = project;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingProject = null;
  }

  confirmDeleteProject(): void {
    if (!this.deletingProject) return;
    const id = this.deletingProject.id;

    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== id);
        if (this.activeProjectId === id) {
          this.projectService.setActiveProject(null);
        }
        this.closeDeleteModal();
      },
      error: (err) => console.error('Błąd usuwania projektu', err)
    });
  }
}
