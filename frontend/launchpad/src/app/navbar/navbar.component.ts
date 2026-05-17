import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {ProjectSidebarComponent} from "../project-sidebar/project-sidebar.component";
import {ProjectModel} from "../model/project-dto";
import {ProjectService} from "../services/project/project.service";
import {AuthenticationService} from "../services/authentication/authentication.service";
import {UserResponse} from "../model/admin-dto";
import {Router} from "@angular/router";

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
  userPanelOpen = false;
  activeProject: ProjectModel | null = null;
  currentUser: UserResponse | null = null;
  userLoading = false;
  userError = '';
  activeTab: 'kanban' | 'management' = 'kanban';

  constructor(
    private projectService: ProjectService,
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {}

  toggleSidebar(): void {
    this.userPanelOpen = false;
    this.sidebarOpen = !this.sidebarOpen;
  }

  goHome(): void {
    this.projectService.setActiveProject(null as unknown as ProjectModel);
    this.selectTab('kanban');
    this.sidebarOpen = false;
    this.userPanelOpen = false;
  }

  toggleUserPanel(): void {
    this.sidebarOpen = false;
    this.userPanelOpen = !this.userPanelOpen;
    if (this.userPanelOpen) {
      this.loadCurrentUser();
    }
  }

  closeUserPanel(): void {
    this.userPanelOpen = false;
  }

  logout(): void {
    this.authenticationService.logout();
    this.projectService.setActiveProject(null as unknown as ProjectModel);
    this.activeProject = null;
    this.currentUser = null;
    this.userError = '';
    this.userLoading = false;
    this.sidebarOpen = false;
    this.userPanelOpen = false;
    this.activeTab = 'kanban';
    this.router.navigate(['/login']);
  }

  private loadCurrentUser(): void {
    this.userLoading = true;
    this.userError = '';

    this.authenticationService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.userLoading = false;
      },
      error: () => {
        this.currentUser = null;
        this.userError = 'Nie udalo sie pobrac danych uzytkownika.';
        this.userLoading = false;
      }
    });
  }

  onProjectSelected(project: ProjectModel) {
    this.activeProject = project;
  }

  selectTab(tab: 'kanban' | 'management'): void {
    this.activeTab = tab;
    this.userPanelOpen = false;
    this.tabChanged.emit(tab);
  }

  ngOnInit(): void {
    this.projectService.activeProject$.subscribe(project => this.activeProject = project);
  }
}
