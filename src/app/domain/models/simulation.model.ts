export interface SimulationConfig {
  moneda: string;
  tipoTasa: 'Efectiva' | 'Nominal';
  tasaValor: number;
  capitalizacion?: string; // IMPORTANTE: Agregado para soportar nominal
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

// ESTA ES LA CLAVE: Debe coincidir con C# (camelCase)
export interface AmortizationDetail {
  period: number;           // Antes: numeroCuota
  paymentDate: string;      // Antes: fechaVencimiento
  payment: number;          // Antes: cuotaTotal
  interest: number;         // Antes: interes
  amortizacion: number;     // C#: Amortization -> JSON: amortization
  balance: number;          // Antes: saldoFinal
  seguros: number;          // NUEVO: Viene del Backend
  gastos: number;           // NUEVO: Viene del Backend
}

export interface SimulationResult {
  // Coincidencia con propiedades de clase Simulation (C#)
  loanAmount: number;       // Antes: montoPrestamo
  fixedQuota: number;       // Antes: cuotaFijaPromedio
  tcea: number;
  van: number;
  tir: number;              // O annualIRR si usaste ese nombre en el DTO
  totalIntereses: number;   // totalInterests
  costoTotalCredito: number;// totalCreditCost
  gastosAdministrativos: number; // insuranceMaintenanceFees
  cronograma: AmortizationDetail[]; // El array con el nuevo tipo
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
