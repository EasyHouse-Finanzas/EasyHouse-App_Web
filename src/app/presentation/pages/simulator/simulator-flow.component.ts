import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ClientService } from '../../../infrastructure/services/client.service';
import { RealEstateService } from '../../../infrastructure/services/real-estate.service';
import { ConfigService } from '../../../infrastructure/services/config.service';
import { SimulationService } from '../../../infrastructure/services/simulation.service';
import { FinancialCalculatorService } from '../../../infrastructure/services/financial-calculator.service';
import { Client } from '../../../domain/models/client.model';
import { RealEstate } from '../../../domain/models/real-estate.model';
import { SimulationResult, CreateConfigCommand, CreateSimulationCommand } from '../../../domain/models/simulation.model';
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

  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private houseService = inject(RealEstateService);
  private configService = inject(ConfigService);
  private simulationService = inject(SimulationService);
  private financialService = inject(FinancialCalculatorService);

  constructor() {
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
      seguroRiesgo: [0.030, Validators.min(0)],
      annualDiscountRate: [0.10, [Validators.required, Validators.min(0)]]
    });

    this.simulationForm = this.fb.group({
      cuotaInicial: [0, [Validators.required, Validators.min(0)]],
      plazoMeses: [120, [Validators.required, Validators.min(6), Validators.max(300)]],
      fechaInicio: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.clientService.getClients().subscribe(data => {
      console.log('📦 DATA CLIENTES RECIBIDA:', data);
      this.clients = data;
    });
    this.houseService.getHouses().subscribe(data => this.houses = data);

    this.configForm.get('viviendaId')?.valueChanges.subscribe(id => {
      this.selectedHouse = this.houses.find(h => h.houseId === id);

      if (this.selectedHouse) {
        const precio = this.selectedHouse.price !== undefined ? this.selectedHouse.price : (this.selectedHouse as any).precio;
        this.simulationForm.patchValue({
          cuotaInicial: precio * 0.10
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

      const precio = this.selectedHouse.price !== undefined ? this.selectedHouse.price : (this.selectedHouse as any).precio;

      this.financialService.calculate(fullConfig, precio).subscribe({
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
    if (!this.simulationResult || this.configForm.invalid || this.simulationForm.invalid) return;

    this.isSaving = true;
    const formConfig = this.configForm.value;
    const formSim = this.simulationForm.value;

    const configPayload: CreateConfigCommand = {
      currency: formConfig.moneda,
      rateType: formConfig.tipoTasa,
      tea: formConfig.tipoTasa === 'Efectiva' ? (formConfig.tasaValor / 100) : 0,
      tna: formConfig.tipoTasa === 'Nominal' ? (formConfig.tasaValor / 100) : 0,
      capitalization: formConfig.capitalizacion,
      gracePeriodType: formConfig.periodoGracia,
      graceMonths: formConfig.mesesGracia,
      housingBonus: formConfig.bonoTechoPropio,
      disbursementCommission: formConfig.comisionDesembolso,
      monthlyMaintenance: formConfig.mantenimientoMensual,
      monthlyFees: formConfig.portesMensuales,
      itf: formConfig.itf,
      lifeInsurance: formConfig.seguroDesgravamen / 100,
      riskInsurance: formConfig.seguroRiesgo / 100,
      annualDiscountRate: formConfig.annualDiscountRate
    };

    this.configService.createConfig(configPayload).pipe(
      switchMap((responseConfig: any) => {
        const configId = responseConfig?.configId || responseConfig?.id || responseConfig;

        if (!configId) {
          throw new Error('No se pudo obtener el ID de la configuración creada');
        }

        const simulationPayload: CreateSimulationCommand = {
          clientId: formConfig.clienteId,
          houseId: formConfig.viviendaId,
          configId: configId,
          initialQuota: Number(formSim.cuotaInicial),
          termMonths: Number(formSim.plazoMeses),
          startDate: new Date(formSim.fechaInicio).toISOString()
        };

        return this.simulationService.createSimulation(simulationPayload);
      })
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.isSaved = true;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.isSaving = false;
        alert('Ocurrió un error al guardar la simulación.');
      }
    });
  }

  downloadPDF() {
    if (!this.simulationResult || !this.selectedHouse) {
      alert('No hay datos de simulación o vivienda seleccionada.');
      return;
    }

    const selectedClientId = this.configForm.get('clienteId')?.value;

    const client = this.clients.find(c =>
      (c.id && c.id === selectedClientId) ||
      (c.clientId && c.clientId === selectedClientId)
    );

    if (!client) {
      alert('Error: No se encontró la información del cliente seleccionado para generar el reporte.');
      return;
    }
    this.generatePDF(this.simulationResult, client, this.selectedHouse);
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
    doc.text(`Fecha de Impresión: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', 14, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`${client.firstName} ${client.lastName}`, 14, 45);
    doc.text(`DNI: ${client.documentNumber}`, 14, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('INMUEBLE:', 110, 40);
    doc.setFont('helvetica', 'normal');
    const projectName = house.project || house.proyecto || 'Sin Nombre';
    doc.text(`Proyecto: ${projectName}`, 110, 45);

    const precio = house.price !== undefined ? house.price : house.precio;
    doc.text(`Valor: $ ${Number(precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 110, 50);

    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 60, 182, 30, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(31, 141, 233);
    doc.text('INDICADORES FINANCIEROS', 105, 68, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text(`Monto Préstamo: S/ ${simulationResult.loanAmount.toFixed(2)}`, 20, 78);
    doc.text(`VAN: ${simulationResult.van.toFixed(2)}`, 80, 78);
    doc.text(`TIR: ${simulationResult.tir}%`, 140, 78);

    doc.text(`TCEA: ${simulationResult.tcea}%`, 20, 85);
    doc.text(`Cuota Ref: S/ ${simulationResult.fixedQuota.toFixed(2)}`, 80, 85);
    doc.text(`Costo Total: S/ ${simulationResult.costoTotalCredito.toFixed(2)}`, 140, 85);

    autoTable(doc, {
      startY: 100,
      head: [['N°', 'Fecha', 'Cuota Total', 'Interés', 'Amort.', 'Seguros', 'Saldo']],
      body: simulationResult.cronograma.map((row: any) => [
        row.period,
        new Date(row.paymentDate).toLocaleDateString(),
        row.payment.toFixed(2),
        row.interest.toFixed(2),
        row.amortizacion.toFixed(2),
        (row.seguros + row.gastos).toFixed(2),
        row.balance.toFixed(2)
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

    const nombreArchivo = `reporte_easyHouse-${client.documentNumber}.pdf`;
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
      seguroRiesgo: 0.030,
      annualDiscountRate: 0.10
    });

    this.simulationForm.reset({
      cuotaInicial: 0,
      plazoMeses: 120,
      fechaInicio: new Date().toISOString().split('T')[0]
    });
  }
}
