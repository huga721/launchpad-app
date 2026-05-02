import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {ProjectSidebarComponent} from "../project-sidebar/project-sidebar.component";
import {ProjectModel} from "../model/project-dto";
import {ProjectService} from "../services/project/project.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgIf,
    ProjectSidebarComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  sidebarOpen = false;

  activeProject: ProjectModel | null = null;

  constructor(private projectService: ProjectService) {
  }

  toggleSidebar(): void {
    console.log("Current sidebar status: " + this.sidebarOpen)
    this.sidebarOpen = !this.sidebarOpen
  }

  onProjectSelected(project: ProjectModel) {
    this.activeProject = project
  }

  ngOnInit(): void {
    this.projectService.activeProject$.subscribe(project => this.activeProject = project)
  }
}
