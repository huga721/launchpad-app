import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from "../navbar/navbar.component";
import {NgIf} from "@angular/common";
import {ProjectMenuComponent} from "../project-menu/project-menu.component";
import {ProjectModel} from "../model/project-dto";
import {ProjectService} from "../services/project/project.service";

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    NavbarComponent,
    NgIf
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  activeProject: ProjectModel | null = null

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.activeProject$.subscribe(project => this.activeProject = project)
  }
}
