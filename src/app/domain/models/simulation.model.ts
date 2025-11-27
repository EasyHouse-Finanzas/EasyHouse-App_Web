
export interface SimulationConfig {
  moneda: string;
  tipoTasa: 'Efectiva' | 'Nominal';
  tasaValor: number;
  capitalizacion?: string;
  periodoGracia: string;
  mesesGracia: number;
  bonoTechoPropio: number;
  cuotaInicial: number;
  plazoMeses: number;
  fechaInicio: string;
  comisionDesembolso: number;
  mantenimientoMensual: number;
  portesMensuales: number;
  itf?: number;
  seguroDesgravamen: number;
  seguroRiesgo: number;
  annualDiscountRate?: number;
}

export interface AmortizationScheduleItem {
  numeroCuota: number;
  fechaVencimiento: string;
  saldoInicial: number;
  interes: number;
  cuotaBase: number;
  amortizacion: number;
  seguros: number;
  gastos: number;
  cuotaTotal: number;
  saldoFinal: number;
}

export interface SimulationResult {
  montoPrestamo: number;
  cuotaFijaPromedio: number;
  tcea: number;
  van: number;
  tir: number;
  totalIntereses: number;
  costoTotalCredito: number;
  gastosAdministrativos: number;
  cronograma: AmortizationScheduleItem[];
}

export interface CreateConfigCommand {
  currency: string;
  rateType: string;
  tea?: number;
  tna?: number;
  capitalization: string;
  gracePeriodType: string;
  graceMonths: number;
  housingBonus: number;
  disbursementCommission: number;
  monthlyMaintenance: number;
  monthlyFees: number;
  itf: number;
  lifeInsurance: number;
  riskInsurance: number;
  annualDiscountRate: number;
}

export interface CreateSimulationCommand {
  clientId: string;
  houseId: string;
  configId: string;
  initialQuota: number;
  termMonths: number;
  startDate: string;
}
