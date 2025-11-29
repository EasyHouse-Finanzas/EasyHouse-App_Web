import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { SimulationService } from '../../../infrastructure/services/simulation.service';
import { ClientService } from '../../../infrastructure/services/client.service';
import { RealEstateService } from '../../../infrastructure/services/real-estate.service';
import { FinancialCalculatorService } from '../../../infrastructure/services/financial-calculator.service';
import { SimulationConfig } from '../../../domain/models/simulation.model';

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
  private financialService = inject(FinancialCalculatorService);

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

        this.reports = simulations.map((sim: any) => {
          const client = clients.find(c => (c.clientId || c.id) === sim.clientId);
          const house = houses.find(h => (h.houseId || h.id) === sim.houseId);

          const price = house ? Number(house.price) : 0;
          const initQuota = Number(sim.initialQuota);
          const loanAmount = price - initQuota;

          return {
            id: sim.simulationId || sim.id,
            date: sim.startDate,
            clientName: client ? `${client.firstName} ${client.lastName}` : 'Cliente No Encontrado',
            projectName: house ? house.project : 'Inmueble No Encontrado',
            propertyCode: house ? house.propertyCode : '---',
            currency: sim.config?.currency || 'PEN',
            loanAmount: loanAmount > 0 ? loanAmount : 0,
            tcea: sim.tcea || 0
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

  downloadReport(reportItem: any) {
    if (!reportItem.id) {
      alert('Error: ID de reporte no válido');
      return;
    }

    document.body.style.cursor = 'wait';

    this.simulationService.getSimulationById(reportItem.id).subscribe({
      next: (fullSim) => {
        if (!fullSim || !fullSim.config || !fullSim.house || !fullSim.client) {
          document.body.style.cursor = 'default';
          alert('No se pudieron cargar los detalles completos de la simulación para regenerar el PDF.');
          return;
        }

        const configForCalc: SimulationConfig = {
          moneda: fullSim.config.currency,
          tipoTasa: fullSim.config.rateType,
          tasaValor: fullSim.config.rateType === 'Efectiva' ? (fullSim.config.tea * 100) : (fullSim.config.tna * 100),
          capitalizacion: fullSim.config.capitalization,
          periodoGracia: fullSim.config.gracePeriodType,
          mesesGracia: fullSim.config.graceMonths,
          bonoTechoPropio: fullSim.config.housingBonus,
          cuotaInicial: fullSim.initialQuota,
          plazoMeses: fullSim.termMonths,
          fechaInicio: fullSim.startDate,
          comisionDesembolso: fullSim.config.disbursementCommission,
          mantenimientoMensual: fullSim.config.monthlyMaintenance,
          portesMensuales: fullSim.config.monthlyFees,
          itf: fullSim.config.itf,
          seguroDesgravamen: fullSim.config.lifeInsurance * 100,
          seguroRiesgo: fullSim.config.riskInsurance * 100,
          annualDiscountRate: fullSim.config.annualDiscountRate
        };

        const housePrice = fullSim.house.price !== undefined ? fullSim.house.price : fullSim.house.precio;

        this.financialService.calculate(configForCalc, housePrice).subscribe({
          next: (result) => {
            this.generatePDF(result, fullSim.client, fullSim.house);
            document.body.style.cursor = 'default';
          },
          error: () => document.body.style.cursor = 'default'
        });
      },
      error: (err) => {
        console.error('Error al descargar detalles:', err);
        document.body.style.cursor = 'default';
        alert('Hubo un error al intentar generar el PDF.');
      }
    });
  }

  private generatePDF(simulationResult: any, client: any, house: any) {
    const doc = new jsPDF();

    doc.setFillColor(31, 141, 233);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('EasyHouse - Reporte de Crédito', 105, 13, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 14, 30);

    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE:', 14, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`${client.firstName} ${client.lastName}`, 14, 45);
    doc.text(`DNI: ${client.documentNumber}`, 14, 50);

    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL INMUEBLE:', 110, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Proyecto: ${house.project || house.proyecto}`, 110, 45);
    const precio = house.price !== undefined ? house.price : house.precio;
    doc.text(`Valor: $ ${Number(precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 110, 50);

    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 60, 182, 30, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(31, 141, 233);
    doc.text('RESUMEN DE LA SIMULACIÓN', 105, 68, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text(`Préstamo Neto: S/ ${simulationResult.loanAmount.toFixed(2)}`, 20, 78);
    doc.text(`VAN: ${simulationResult.van.toFixed(2)}`, 80, 78);
    doc.text(`TIR: ${simulationResult.tir}%`, 140, 78);

    doc.text(`TCEA: ${simulationResult.tcea}%`, 20, 85);
    doc.text(`Cuota Mensual: S/ ${simulationResult.fixedQuota.toFixed(2)}`, 80, 85);
    doc.text(`Costo Total: S/ ${simulationResult.costoTotalCredito.toFixed(2)}`, 140, 85);

    autoTable(doc, {
      startY: 100,
      head: [['N°', 'Vencimiento', 'Cuota', 'Interés', 'Capital', 'Seguros', 'Saldo']],
      body: simulationResult.cronograma.map((row: any) => [
        row.period,
        new Date(row.paymentDate).toLocaleDateString(),
        row.payment.toFixed(2),
        row.interest.toFixed(2),
        row.amortizacion.toFixed(2),
        (row.seguros + row.gastos).toFixed(2),
        row.balance.toFixed(2)
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [31, 141, 233],
        halign: 'center',
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
      },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    const nombreArchivo = `Reporte_${client.documentNumber}_${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
  }
}
