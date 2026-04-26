import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-project-menu',
  standalone: true,
  imports: [],
  templateUrl: './project-menu.component.html',
  styleUrls: ['./project-menu.component.css']
})
export class ProjectMenuComponent {
  @Output() close = new EventEmitter<void>();

  closeSidebar(): void {
    this.close.emit();
  }
}
