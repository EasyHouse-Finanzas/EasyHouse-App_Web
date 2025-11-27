import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { SimulationService } from '../../../infrastructure/services/simulation.service';
import { ClientService } from '../../../infrastructure/services/client.service';
import { RealEstateService } from '../../../infrastructure/services/real-estate.service';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-list.component.html'
})
export class ReportListComponent implements OnInit {
  reports: any[] = [];
  isLoading = true;

  private simulationService = inject(SimulationService);
  private clientService = inject(ClientService);
  private houseService = inject(RealEstateService);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    forkJoin({
      simulations: this.simulationService.getSimulations(),
      clients: this.clientService.getClients(),
      houses: this.houseService.getHouses()
    }).subscribe({
      next: (response) => {
        const { simulations, clients, houses } = response;
        this.reports = simulations.map(sim => {
          const client = clients.find(c => c.id === sim.clientId);
          const house = houses.find(h => h.houseId === sim.houseId);
          const loanAmount = (house && sim.initialQuota)
            ? (house.price - sim.initialQuota)
            : 0;

          return {
            id: sim.id,
            date: sim.startDate,
            clientName: client ? `${client.firstName} ${client.lastName}` : 'Cliente No Encontrado',
            projectName: house ? house.project : 'Inmueble No Encontrado',
            currency: 'PEN',
            loanAmount: loanAmount,
            tcea: sim.tcea || null
          };
        });
        this.reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.isLoading = false;
      },
      error: (e) => {
        console.error('Error cargando el historial:', e);
        this.isLoading = false;
      }
    });
  }

  downloadReport(report: any) {
    alert(`Funcionalidad de descarga para el reporte #${report.id.substring(0, 8)}...\nSe debe implementar la regeneración del PDF con los datos del backend.`);
  }
}
