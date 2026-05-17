import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ProjectService} from "../services/project/project.service";
import {CreateProjectRequest, ProjectModel} from "../model/project-dto";

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

  showModal = false;
  activeProjectId: string | null = null;

  projects: ProjectModel[] = []

  createProjectForm = new FormGroup({
    projectName: new FormControl('', [Validators.required]),
    projectDescription: new FormControl('')
  })

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects()
      .subscribe(data => this.projects = data)

    this.projectService.activeProject$
      .subscribe(project => this.activeProjectId = project?.id ?? null)
  }

  closeSidebar(): void {
    this.sidebarClose.emit();
  }

  selectProject(project: ProjectModel) {
    this.projectService.setActiveProject(project)
    this.selectedProject.emit(project)
    this.activeProjectId = project.id
  }

  addProject(): void {
    if (this.createProjectForm.invalid) {
      return;
    }

    const createProjectRequest: CreateProjectRequest = {
      name: (this.createProjectForm.value.projectName ?? "").trim(),
      description: this.createProjectForm.value.projectDescription ?? ""
    }

    if (!createProjectRequest.name) {
      return;
    }

    this.projectService.createProject(createProjectRequest).subscribe({
      next: (result) => {
        this.projects = [result, ...this.projects]
        this.createProjectForm.reset({ projectName: '', projectDescription: '' })
        this.showModal = false;
      },
      error: (error) => console.error("Error ", error)
    })
  }
}
