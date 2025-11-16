import { Component, Input } from '@angular/core';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen: boolean=true;
  navLinks = [
    {
      path: '/app/inicio',
      label: 'Inicio',
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 4h.01M10 16h.01'
    },
    {
      path: '/app/clientes',
      label: 'Clientes',
      iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6v1a6 6 0 01-6 6v-1z'
    },
    {
      path: '/app/unidades',
      label: 'Unidades Inmobiliarias',
      iconPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
    },
    {
      path: '/app/simulador',
      label: 'Simulador',
      iconPath: 'M9 7h6m0 0l-3-3m3 3l-3 3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      path: '/app/reportes',
      label: 'Historial de Reportes',
      iconPath: 'M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
  ];
}
