import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet, CommonModule],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  isSidebarOpen = signal(true);
  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }
}
