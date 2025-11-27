import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../infrastructure/services/mock-data.service';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-list.component.html'
})
export class ReportListComponent implements OnInit {
  reports: any[] = [];
  isLoading = true;

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.dataService.getSimulations().subscribe({
      next: (data) => {
        // Ordenamos por fecha descendente
        this.reports = data.sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime());
        this.isLoading = false;
      },
      error: (e) => {
        console.error(e);
        this.isLoading = false;
      }
    });
  }

  // Aquí podríamos implementar la lógica para regenerar el PDF
  downloadReport(report: any) {
    alert(`Descargando reporte #${report.simulacion_id} para ${report.nombreCliente}... \n(Funcionalidad pendiente de migrar al servicio)`);
  }
}
