import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../infrastructure/services/auth.service';
import { ClientService } from '../../../infrastructure/services/client.service';
import { RealEstateService } from '../../../infrastructure/services/real-estate.service';
import { SimulationService } from '../../../infrastructure/services/simulation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private houseService = inject(RealEstateService);
  private simulationService = inject(SimulationService);

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user && user.name ? user.name : 'Agente';
  });

  summaryCards = [
    { title: 'Cartera de Clientes', value: '...', icon: 'users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Simulaciones Realizadas', value: '...', icon: 'calculator', color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Unidades Disponibles', value: '...', icon: 'home', color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Monto Total Simulado', value: '...', icon: 'money', color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  latestSimulations: any[] = [];
  exchangeRate = 3.37;
  amountPEN: number | null = null;
  amountUSD: number | null = null;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    forkJoin({
      clients: this.clientService.getClients(),
      houses: this.houseService.getHouses(),
      simulations: this.simulationService.getSimulations()
    }).subscribe({
      next: (data) => {
        const totalClients = data.clients.length;
        const totalHouses = data.houses.length;
        const totalSimulations = data.simulations.length;
        const totalAmount = data.simulations.reduce((acc, sim: any) => {
          const house = data.houses.find(h => (h.houseId || h.id) === sim.houseId);

          if (house) {
            const price = Number(house.price);
            const initialQuota = Number(sim.initialQuota);
            const loan = price - initialQuota;
            return acc + (loan > 0 ? loan : 0);
          }
          return acc;
        }, 0);
        this.summaryCards[0].value = totalClients.toString();
        this.summaryCards[1].value = totalSimulations.toString();
        this.summaryCards[2].value = totalHouses.toString();
        if (totalAmount >= 1000000) {
          this.summaryCards[3].value = `S/ ${(totalAmount / 1000000).toFixed(2)}M`;
        } else if (totalAmount >= 1000) {
          this.summaryCards[3].value = `S/ ${(totalAmount / 1000).toFixed(1)}K`;
        } else {
          this.summaryCards[3].value = `S/ ${totalAmount.toFixed(0)}`;
        }
        this.latestSimulations = data.simulations
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5)
          .map((sim: any) => {
            const client = data.clients.find(c => (c.clientId || c.id) === sim.clientId);
            const house = data.houses.find(h => (h.houseId || h.id) === sim.houseId);
            const price = house ? Number(house.price) : 0;
            const loan = price - Number(sim.initialQuota);

            return {
              id: sim.simulationId || sim.id,
              cliente: client ? `${client.firstName} ${client.lastName}` : 'Desconocido',
              proyecto: house ? house.project : 'N/A',
              fecha: new Date(sim.startDate).toLocaleDateString(),
              monto: loan,
              tcea: sim.tcea || 0
            };
          });
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.summaryCards.forEach(c => c.value = '0');
      }
    });
  }
  convertPENtoUSD() {
    if (this.amountPEN) {
      this.amountUSD = parseFloat((this.amountPEN / this.exchangeRate).toFixed(2));
    } else {
      this.amountUSD = null;
    }
  }
  convertUSDtoPEN() {
    if (this.amountUSD) {
      this.amountPEN = parseFloat((this.amountUSD * this.exchangeRate).toFixed(2));
    } else {
      this.amountPEN = null;
    }
  }
}
