export interface SimulationConfig {
  clienteId: number;
  viviendaId: number;
  moneda: 'PEN' | 'USD';
  tipoTasa: 'Efectiva' | 'Nominal';
  tasaValor: number;
  capitalizacion?: 'Diaria' | 'Mensual';
  periodoGracia: 'Ninguno' | 'Parcial' | 'Total';
  mesesGracia: number;
  bonoTechoPropio: number;
  cuotaInicial: number;
  plazoMeses: number;
  fechaInicio: string;
  comisionDesembolso: number;
  mantenimientoMensual: number;
  portesMensuales: number;
  itf: number;
  seguroDesgravamen: number;
  seguroRiesgo: number;
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
