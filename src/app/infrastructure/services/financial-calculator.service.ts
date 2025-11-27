import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SimulationConfig, SimulationResult, AmortizationScheduleItem } from '../../domain/models/simulation.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialCalculatorService {

  constructor() { }

  calculate(config: SimulationConfig, precioVivienda: number): Observable<SimulationResult> {

    // 1. Calcular Monto del Préstamo (Principal)
    // P = Precio - Inicial - Bono
    let principal = precioVivienda - config.cuotaInicial;
    if (config.bonoTechoPropio > 0) {
      principal -= config.bonoTechoPropio;
    }

    // 2. Calcular Tasa Efectiva Mensual (TEM)
    const tem = this.calculateTEM(config);

    // 3. Generar Cronograma
    const schedule = this.generateSchedule(principal, tem, config, precioVivienda);

    // 4. Calcular Indicadores
    const totalIntereses = schedule.reduce((sum, item) => sum + item.interes, 0);
    const totalSegurosGastos = schedule.reduce((sum, item) => sum + item.seguros + item.gastos, 0);

    // Flujo de Caja para TIR y VAN
    // Flujo 0 = Préstamo recibido - Gastos iniciales (Desembolso)
    // Flujos 1..n = -CuotaTotal (Pagos)
    const flows = [-1 * (principal - config.comisionDesembolso)];
    schedule.forEach(item => flows.push(item.cuotaTotal));

    const tir = this.calculateIRR(flows) * 100; // TCEA mensual aprox convertida a porcentaje
    // TCEA Anual = (1 + TIR_mensual)^12 - 1
    const tcea = (Math.pow(1 + (tir/100), 12) - 1) * 100;

    // VAN (Usando la misma TEM como tasa de descuento a falta de COK)
    const van = this.calculateNPV(tem, flows);

    const result: SimulationResult = {
      montoPrestamo: principal,
      cuotaFijaPromedio: schedule[schedule.length - 1].cuotaTotal, // Tomamos la última como referencia
      tcea: parseFloat(tcea.toFixed(2)),
      van: parseFloat(van.toFixed(2)),
      tir: parseFloat(tcea.toFixed(2)), // Mostramos TCEA como TIR del crédito
      totalIntereses: parseFloat(totalIntereses.toFixed(2)),
      costoTotalCredito: parseFloat((principal + totalIntereses + totalSegurosGastos + config.comisionDesembolso).toFixed(2)),
      gastosAdministrativos: parseFloat((totalSegurosGastos + config.comisionDesembolso).toFixed(2)),
      cronograma: schedule
    };

    return of(result);
  }

  // --- Ayudantes de Cálculo ---

  private calculateTEM(config: SimulationConfig): number {
    // Si es Efectiva Anual (TEA)
    if (config.tipoTasa === 'Efectiva') {
      // TEM = (1 + TEA)^(1/12) - 1
      return Math.pow(1 + (config.tasaValor / 100), 1 / 12) - 1;
    }
    // Si es Nominal Anual (TNA)
    else {
      // Asumiendo capitalización mensual si no se especifica diario
      if (config.capitalizacion === 'Diaria') {
        // TNA -> TED -> TEM
        // TED = TNA / 360
        // TEM = (1 + TED)^30 - 1
        const ted = (config.tasaValor / 100) / 360;
        return Math.pow(1 + ted, 30) - 1;
      } else {
        // Capitalización Mensual: TEM = TNA / 12
        return (config.tasaValor / 100) / 12;
      }
    }
  }

  private generateSchedule(principal: number, tem: number, config: SimulationConfig, valorVivienda: number): AmortizationScheduleItem[] {
    const schedule: AmortizationScheduleItem[] = [];
    let saldo = principal;
    const n = config.plazoMeses;
    let currentDate = new Date(config.fechaInicio);

    // Costos fijos mensuales
    const gastosFijos = config.mantenimientoMensual + config.portesMensuales;

    for (let i = 1; i <= n; i++) {
      // Avanzar un mes
      currentDate.setMonth(currentDate.getMonth() + 1);

      const interes = saldo * tem;
      const seguroDesg = saldo * (config.seguroDesgravamen / 100);
      const seguroRiesgo = valorVivienda * (config.seguroRiesgo / 100);
      const segurosTotal = seguroDesg + seguroRiesgo;

      let amortizacion = 0;
      let cuotaBase = 0; // (Interés + Amortización)

      // --- Lógica Periodos de Gracia ---
      if (i <= config.mesesGracia && config.periodoGracia !== 'Ninguno') {
        if (config.periodoGracia === 'Parcial') {
          // Paga intereses, no amortiza
          amortizacion = 0;
          cuotaBase = interes;
        } else {
          // Total: No paga nada (ni intereses). Interés se capitaliza.
          amortizacion = 0;
          cuotaBase = 0;
          saldo += interes; // Capitalización
        }
      }
      else {
        // --- Método Francés ---
        // Calcular cuota fija sobre el saldo actual y meses restantes
        const mesesRestantes = n - i + 1;
        const factor = Math.pow(1 + tem, mesesRestantes);

        // R = P * [ i(1+i)^n ] / [ (1+i)^n - 1 ]
        cuotaBase = saldo * ( (tem * factor) / (factor - 1) );

        amortizacion = cuotaBase - interes;
        saldo -= amortizacion;
      }

      // Ajuste final para evitar saldo negativo o decimales sueltos
      if (saldo < 0 || (i === n && saldo > 0)) {
        if (saldo < 0) amortizacion += saldo; // Restar el exceso
        saldo = 0;
      }

      schedule.push({
        numeroCuota: i,
        fechaVencimiento: currentDate.toISOString(),
        saldoInicial: parseFloat((saldo + amortizacion).toFixed(2)), // Saldo antes de pagar
        interes: parseFloat(interes.toFixed(2)),
        cuotaBase: parseFloat(cuotaBase.toFixed(2)),
        amortizacion: parseFloat(amortizacion.toFixed(2)),
        seguros: parseFloat(segurosTotal.toFixed(2)),
        gastos: parseFloat(gastosFijos.toFixed(2)),
        cuotaTotal: parseFloat((cuotaBase + segurosTotal + gastosFijos).toFixed(2)),
        saldoFinal: parseFloat(saldo.toFixed(2))
      });
    }

    return schedule;
  }

  // Cálculo de TIR (Internal Rate of Return) usando Newton-Raphson
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

      const x1 = x0 - fValue / fDerivative;

      if (Math.abs(x1 - x0) <= tol) return x1;
      x0 = x1;
    }
    return x0;
  }

  // Cálculo de VAN (Net Present Value)
  private calculateNPV(rate: number, values: number[]): number {
    let npv = 0;
    for (let i = 0; i < values.length; i++) {
      npv += values[i] / Math.pow(1 + rate, i);
    }
    return npv;
  }
}
