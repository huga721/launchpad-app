import {Component, EventEmitter, OnInit, Output} from '@angular/core';
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

  @Output() tabChanged = new EventEmitter<'kanban' | 'management'>();

  sidebarOpen = false;
  activeProject: ProjectModel | null = null;
  activeTab: 'kanban' | 'management' = 'kanban';

  constructor(private projectService: ProjectService) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onProjectSelected(project: ProjectModel) {
    this.activeProject = project;
  }

  selectTab(tab: 'kanban' | 'management'): void {
    this.activeTab = tab;
    this.tabChanged.emit(tab);
  }

  ngOnInit(): void {
    this.projectService.activeProject$.subscribe(project => this.activeProject = project);
  }
}
