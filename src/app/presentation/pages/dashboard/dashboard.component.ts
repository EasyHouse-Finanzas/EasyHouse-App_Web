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
    {
      title: 'Cartera de Clientes',
      value: '15',
      icon: 'users',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Simulaciones Realizadas',
      value: '42',
      icon: 'calculator',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Unidades Disponibles',
      value: '8',
      icon: 'home',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Monto Total Simulado',
      value: 'S/ 12.5M',
      icon: 'money',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];
  latestSimulations = [
    {
      id: 105,
      cliente: 'Juan Pérez',
      proyecto: 'Residencial Los Álamos',
      fecha: '26/11/2025',
      monto: 250000.00,
      tcea: 14.5
    },
    {
      id: 104,
      cliente: 'María Rodríguez',
      proyecto: 'Edificio Sky Tower',
      fecha: '25/11/2025',
      monto: 180000.50,
      tcea: 13.8
    },
    {
      id: 103,
      cliente: 'Carlos Ruiz',
      proyecto: 'Condominio El Sol',
      fecha: '24/11/2025',
      monto: 320000.00,
      tcea: 15.2
    }
  ];
}
