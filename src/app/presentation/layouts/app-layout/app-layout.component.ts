import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterOutlet, CommonModule],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements OnInit {
  isSidebarOpen = signal(true);
  currentTitle = signal('Inicio');

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
    });
    this.updateTitle();
  }

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  private updateTitle() {
    const url = this.router.url;

    if (url.includes('/dashboard')) {
      this.currentTitle.set('Dashboard General');
    } else if (url.includes('/clients')) {
      this.currentTitle.set('Gestión de Clientes');
    } else if (url.includes('/real-estate')) {
      this.currentTitle.set('Unidades Inmobiliarias');
    } else if (url.includes('/simulator')) {
      this.currentTitle.set('Simulador de Crédito');
    } else if (url.includes('/reports')) {
      this.currentTitle.set('Historial de Reportes');
    } else {
      this.currentTitle.set('EasyHouse');
    }
  }
}
