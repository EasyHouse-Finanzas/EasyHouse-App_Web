import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SimulationConfig, SimulationResult, AmortizationDetail } from '../../domain/models/simulation.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialCalculatorService {

  constructor() { }

  calculate(config: SimulationConfig, precioVivienda: number): Observable<SimulationResult> {

    // 1. Calcular Monto del Préstamo (Principal)
    let principal = precioVivienda - config.cuotaInicial;
    if (config.bonoTechoPropio > 0) {
      principal -= config.bonoTechoPropio;
    }

    // 2. Calcular Tasa Efectiva Mensual (TEM)
    const tem = this.calculateTEM(config);

    // 3. Generar Cronograma (Ahora devuelve AmortizationDetail[])
    const schedule = this.generateSchedule(principal, tem, config, precioVivienda);

    // 4. Calcular Indicadores
    // Nota: Usamos 'interest' y 'seguros'/'gastos' según tu nuevo modelo
    const totalIntereses = schedule.reduce((sum, item) => sum + item.interest, 0);
    const totalSegurosGastos = schedule.reduce((sum, item) => sum + item.seguros + item.gastos, 0);

    // Flujo de Caja para TIR y VAN
    // Flujo 0 = Préstamo recibido - Gastos iniciales (Desembolso)
    const flows = [-1 * (principal - config.comisionDesembolso)];
    // Flujos 1..n = Cuota Total (payment)
    schedule.forEach(item => flows.push(item.payment));

    const tir = this.calculateIRR(flows) * 100; // TCEA mensual aprox
    // TCEA Anual = (1 + TIR_mensual)^12 - 1
    const tcea = (Math.pow(1 + (tir/100), 12) - 1) * 100;

    // VAN
    const van = this.calculateNPV(tem, flows);

    // Mapeo al nuevo modelo (Inglés/Backend Sincronizado)
    const result: SimulationResult = {
      loanAmount: principal, // Antes: montoPrestamo
      fixedQuota: schedule[schedule.length - 1].payment, // Antes: cuotaFijaPromedio
      tcea: parseFloat(tcea.toFixed(2)),
      van: parseFloat(van.toFixed(2)),
      tir: parseFloat(tcea.toFixed(2)),
      totalIntereses: parseFloat(totalIntereses.toFixed(2)),
      costoTotalCredito: parseFloat((principal + totalIntereses + totalSegurosGastos + config.comisionDesembolso).toFixed(2)),
      gastosAdministrativos: parseFloat((totalSegurosGastos + config.comisionDesembolso).toFixed(2)),
      cronograma: schedule
    };

    return of(result);
  }

  // --- Ayudantes de Cálculo ---

  private calculateTEM(config: SimulationConfig): number {
    if (config.tipoTasa === 'Efectiva') {
      return Math.pow(1 + (config.tasaValor / 100), 1 / 12) - 1;
    } else {
      // Capitalización
      if (config.capitalizacion === 'Diaria') {
        const ted = (config.tasaValor / 100) / 360;
        return Math.pow(1 + ted, 30) - 1;
      } else {
        return (config.tasaValor / 100) / 12;
      }
    }
  }

  private generateSchedule(principal: number, tem: number, config: SimulationConfig, valorVivienda: number): AmortizationDetail[] {
    const schedule: AmortizationDetail[] = [];
    let saldo = principal;
    const n = config.plazoMeses;
    let currentDate = new Date(config.fechaInicio);

    const gastosFijos = config.mantenimientoMensual + config.portesMensuales;

    for (let i = 1; i <= n; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);

      const interes = saldo * tem;
      const seguroDesg = saldo * (config.seguroDesgravamen / 100);
      const seguroRiesgo = valorVivienda * (config.seguroRiesgo / 100);
      const segurosTotal = seguroDesg + seguroRiesgo;

      let amortizacion = 0;
      let cuotaBase = 0;

      // --- Lógica Periodos de Gracia ---
      if (i <= config.mesesGracia && config.periodoGracia !== 'Ninguno') {
        if (config.periodoGracia === 'Parcial') {
          amortizacion = 0;
          cuotaBase = interes;
        } else {
          amortizacion = 0;
          cuotaBase = 0;
          saldo += interes;
        }
      }
      else {
        // Método Francés
        const mesesRestantes = n - i + 1;
        const factor = Math.pow(1 + tem, mesesRestantes);

        // Evitar división por cero si tem es 0
        if (tem > 0) {
          cuotaBase = saldo * ( (tem * factor) / (factor - 1) );
        } else {
          cuotaBase = saldo / mesesRestantes;
        }

        amortizacion = cuotaBase - interes;
        saldo -= amortizacion;
      }

      // Ajustes finales
      if (saldo < 0 || (i === n && saldo > 0)) {
        if (saldo < 0) amortizacion += saldo;
        saldo = 0;
      }

      const cuotaTotalCalculada = cuotaBase + segurosTotal + gastosFijos;

      // Mapeo a AmortizationDetail (NUEVO MODELO)
      schedule.push({
        period: i,                                      // Antes: numeroCuota
        paymentDate: currentDate.toISOString(),         // Antes: fechaVencimiento
        payment: parseFloat(cuotaTotalCalculada.toFixed(2)), // Antes: cuotaTotal
        interest: parseFloat(interes.toFixed(2)),       // Antes: interes
        amortizacion: parseFloat(amortizacion.toFixed(2)),
        balance: parseFloat(saldo.toFixed(2)),          // Antes: saldoFinal
        seguros: parseFloat(segurosTotal.toFixed(2)),   // NUEVO
        gastos: parseFloat(gastosFijos.toFixed(2))      // NUEVO
      });
    }

    return schedule;
  }

  // Cálculo de TIR
  private calculateIRR(values: number[], guess: number = 0.1): number {
    const maxIter = 1000;
    const tol = 0.000001;
    let x0 = guess;

    for (let i = 0; i < maxIter; i++) {
      let fValue = 0;
      let fDerivative = 0;

      for (let j = 0; j < values.length; j++) {
        fValue += values[j] / Math.pow(1 + x0, j);
        fDerivative += -j * values[j] / Math.pow(1 + x0, j + 1);
      }
      // Evitar división por cero en derivación
      if (Math.abs(fDerivative) < 1e-10) break;

      const x1 = x0 - fValue / fDerivative;

      if (Math.abs(x1 - x0) <= tol) return x1;
      x0 = x1;
    }
    return x0;
  }

  // Cálculo de VAN
  private calculateNPV(rate: number, values: number[]): number {
    let npv = 0;
    for (let i = 0; i < values.length; i++) {
      npv += values[i] / Math.pow(1 + rate, i);
    }
    return npv;
  }
}
