import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ProjectService} from "../services/project/project.service";
import {CreateProjectRequest, ProjectModel} from "../model/project-dto";
import {ProjectMenuComponent} from "../project-menu/project-menu.component";

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

  projects: ProjectModel[] = []

  createProjectForm = new FormGroup({
    projectName: new FormControl(''),
    projectDescription: new FormControl('')
  })

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects()
      .subscribe(data => this.projects = data)
  }

  closeSidebar(): void {
    this.sidebarClose.emit();
  }

  selectProject(project: ProjectModel) {
    this.projectService.setActiveProject(project)
  }

  addProject(): void {
    const createProjectRequest: CreateProjectRequest = {
      name: this.createProjectForm.value.projectName ?? "",
      description: this.createProjectForm.value.projectDescription ?? ""
    }

    this.projectService.createProject(createProjectRequest).subscribe({
      next: (result) => console.log("Project created ", result),
      error: (error) => console.error("Error ", error)
    })
    this.showModal = false;
  }
}
