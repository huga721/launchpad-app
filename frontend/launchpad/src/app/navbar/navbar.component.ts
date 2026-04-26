import { Component } from '@angular/core';
import {ProjectMenuComponent} from "../project-menu/project-menu.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ProjectMenuComponent,
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  sidebarOpen = false;
  protected readonly open = open;

  toggleSidebar(): void {
    console.log("Current sidebar status: " + this.sidebarOpen)
    this.sidebarOpen = !this.sidebarOpen
  }
}
