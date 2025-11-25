import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  summaryCards = [
    { title: 'Clientes Registrados', value: '12', icon: 'users', color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Simulaciones Totales', value: '34', icon: 'calculator', color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Unidades Inmobiliarias', value: '8', icon: 'home', color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Tasa Promedio (TEA)', value: '14.5%', icon: 'percent', color: 'text-orange-600', bg: 'bg-orange-100' }
  ];
  recentActivity = [
    { client: 'Juan Pérez', action: 'Simulación Crédito Mivivienda', date: 'Hace 2 horas', status: 'Completado' },
    { client: 'María Rodriguez', action: 'Registro de Cliente Nuevo', date: 'Hace 5 horas', status: 'Nuevo' },
    { client: 'Carlos Ruiz', action: 'Consulta de Cronograma', date: 'Ayer', status: 'Revisión' }
  ];
}
