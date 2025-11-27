import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../infrastructure/services/mock-data.service';
import { FinancialCalculatorService } from '../../../infrastructure/services/financial-calculator.service';
import { Client } from '../../../domain/models/client.model';
import { RealEstate } from '../../../domain/models/real-estate.model';
import { SimulationResult } from '../../../domain/models/simulation.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-simulator-flow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './simulator-flow.component.html',
  styleUrls: ['./simulator-flow.component.css']
})
export class SimulatorFlowComponent implements OnInit {
  currentStep: number = 1;
  clients: Client[] = [];
  houses: RealEstate[] = [];
  selectedHouse: RealEstate | undefined;
  configForm: FormGroup;
  simulationForm: FormGroup;
  simulationResult: SimulationResult | null = null;
  isLoadingSimulation = false;
  isSaving = false;
  isSaved = false;

  constructor(
    private fb: FormBuilder,
    private dataService: MockDataService,
    private financialService: FinancialCalculatorService
  ) {
    this.configForm = this.fb.group({
      clienteId: ['', Validators.required],
      viviendaId: ['', Validators.required],
      moneda: ['PEN', Validators.required],
      tipoTasa: ['Efectiva', Validators.required],
      tasaValor: [14.5, [Validators.required, Validators.min(0)]],
      capitalizacion: ['Mensual'],
      periodoGracia: ['Ninguno', Validators.required],
      mesesGracia: [0, [Validators.required, Validators.min(0)]],
      bonoTechoPropio: [0, [Validators.min(0)]],
      comisionDesembolso: [0, Validators.min(0)],
      mantenimientoMensual: [15, Validators.min(0)],
      portesMensuales: [10, Validators.min(0)],
      itf: [0.005, Validators.min(0)],
      seguroDesgravamen: [0.050, Validators.min(0)],
      seguroRiesgo: [0.030, Validators.min(0)]
    });
    this.simulationForm = this.fb.group({
      cuotaInicial: [0, [Validators.required, Validators.min(0)]],
      plazoMeses: [120, [Validators.required, Validators.min(6), Validators.max(300)]], // 10 a 25 años
      fechaInicio: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.dataService.getClients().subscribe(data => this.clients = data);
    this.dataService.getHouses().subscribe(data => this.houses = data);
    this.configForm.get('viviendaId')?.valueChanges.subscribe(id => {
      this.selectedHouse = this.houses.find(h => h.vivienda_id == id);
      if (this.selectedHouse) {
        this.simulationForm.patchValue({
          cuotaInicial: this.selectedHouse.precio * 0.10
        });
      }
    });
  }

  goToSimulator() {
    if (this.configForm.valid) {
      this.currentStep = 2;
    } else {
      this.configForm.markAllAsTouched();
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToSchedule() {
    this.currentStep = 3;
  }

  goToReport() {
    this.currentStep = 4;
  }

  runSimulation() {
    if (this.simulationForm.valid && this.selectedHouse) {
      this.isLoadingSimulation = true;
      const fullConfig = {
        ...this.configForm.value,
        ...this.simulationForm.value
      };

      this.financialService.calculate(fullConfig, this.selectedHouse.precio).subscribe({
        next: (result) => {
          this.simulationResult = result;
          this.isLoadingSimulation = false;
        },
        error: (err) => {
          console.error('Error en la simulación:', err);
          this.isLoadingSimulation = false;
        }
      });
    } else {
      this.simulationForm.markAllAsTouched();
    }
  }

  saveToDatabase() {
    if (!this.simulationResult) return;

    this.isSaving = true;
    const fullConfig = { ...this.configForm.value, ...this.simulationForm.value };

    this.dataService.saveSimulation(fullConfig, this.simulationResult).subscribe(() => {
      this.isSaving = false;
      this.isSaved = true;
    });
  }
  downloadPDF() {
    if (!this.simulationResult || !this.selectedHouse) return;

    const doc = new jsPDF();
    doc.setFillColor(31, 141, 233);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('EasyHouse - Reporte de Crédito', 105, 13, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, 14, 30);
    const clienteId = this.configForm.get('clienteId')?.value;
    const cliente = this.clients.find(c => c.cliente_id == clienteId);
    let dniCliente = '00000000';

    if (cliente) {
      dniCliente = cliente.dni;
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENTE:', 14, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(`${cliente.nombres} ${cliente.apellidos}`, 14, 45);
      doc.text(`DNI: ${cliente.dni}`, 14, 50);
    }
    doc.setFont('helvetica', 'bold');
    doc.text('INMUEBLE:', 110, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Proyecto: ${this.selectedHouse.proyecto}`, 110, 45);
    doc.text(`Valor: $ ${this.selectedHouse.precio.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 110, 50);
    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 60, 182, 30, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(31, 141, 233);
    doc.text('INDICADORES FINANCIEROS', 105, 68, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text(`Monto Préstamo: S/ ${this.simulationResult.montoPrestamo.toFixed(2)}`, 20, 78);
    doc.text(`VAN: ${this.simulationResult.van.toFixed(2)}`, 80, 78);
    doc.text(`TIR: ${this.simulationResult.tir}%`, 140, 78);

    doc.text(`TCEA: ${this.simulationResult.tcea}%`, 20, 85);
    doc.text(`Cuota Ref: S/ ${this.simulationResult.cuotaFijaPromedio.toFixed(2)}`, 80, 85);
    doc.text(`Costo Total: S/ ${this.simulationResult.costoTotalCredito.toFixed(2)}`, 140, 85);

    autoTable(doc, {
      startY: 100,
      head: [['N°', 'Fecha', 'Cuota Total', 'Interés', 'Amort.', 'Seguros', 'Saldo']],
      body: this.simulationResult.cronograma.map(row => [
        row.numeroCuota,
        new Date(row.fechaVencimiento).toLocaleDateString(),
        row.cuotaTotal.toFixed(2),
        row.interes.toFixed(2),
        row.amortizacion.toFixed(2),
        (row.seguros + row.gastos).toFixed(2),
        row.saldoFinal.toFixed(2)
      ]),
      theme: 'striped',
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
      styles: { fontSize: 9, cellPadding: 1.5 }
    });

    const nombreArchivo = `reporte_easyHouse-${dniCliente}.pdf`;
    doc.save(nombreArchivo);
  }

  resetSimulation() {
    this.currentStep = 1;
    this.simulationResult = null;
    this.isSaved = false;
    this.selectedHouse = undefined;
    this.configForm.reset({
      moneda: 'PEN',
      tipoTasa: 'Efectiva',
      tasaValor: 14.5,
      periodoGracia: 'Ninguno',
      mesesGracia: 0,
      bonoTechoPropio: 0,
      comisionDesembolso: 0,
      mantenimientoMensual: 15,
      portesMensuales: 10,
      itf: 0.005,
      seguroDesgravamen: 0.050,
      seguroRiesgo: 0.030
    });

    this.simulationForm.reset({
      cuotaInicial: 0,
      plazoMeses: 120,
      fechaInicio: new Date().toISOString().split('T')[0]
    });
  }
}
