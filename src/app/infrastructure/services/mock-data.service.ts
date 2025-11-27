import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Client } from '../../domain/models/client.model';
import { RealEstate } from '../../domain/models/real-estate.model';
import { SimulationResult } from '../../domain/models/simulation.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // Simulamos la tabla 'clientes'
  private clients: Client[] = [
    { cliente_id: 1, nombres: 'Juan', apellidos: 'Pérez', dni: '12345678', fecha_nacimiento: '1990-05-15', ocupacion: 'Ingeniero de Sistemas', ingresos_mensuales: 4500.00, usuario_id: 1 },
    { cliente_id: 2, nombres: 'María', apellidos: 'Gómez', dni: '87654321', fecha_nacimiento: '1985-10-20', ocupacion: 'Arquitecta', ingresos_mensuales: 6200.50, usuario_id: 1 },
    { cliente_id: 3, nombres: 'Carlos', apellidos: 'Ruiz', dni: '45678912', fecha_nacimiento: '1995-02-28', ocupacion: 'Contador', ingresos_mensuales: 3800.00, usuario_id: 1 }
  ];

  // Simulamos la tabla 'viviendas'
  private houses: RealEstate[] = [
    { vivienda_id: 1, proyecto: 'Residencial Los Álamos', codigo_inmueble: 'PROY-001-A', area_total: 120.5, area_techada: 100.0, ubicacion: 'Av. La Marina 123, San Miguel', precio: 150000.00 },
    { vivienda_id: 2, proyecto: 'Edificio Sky Tower', codigo_inmueble: 'SKY-504', area_total: 85.0, area_techada: 85.0, ubicacion: 'Jr. Huiracocha 456, Jesús María', precio: 120000.00 }
  ];

  // Simulamos la tabla 'simulaciones' con datos iniciales para probar la vista de Reportes
  private simulations: any[] = [
    {
      simulacion_id: 101,
      fecha_registro: new Date('2025-11-20T10:00:00'),
      clienteId: 1,
      viviendaId: 1,
      moneda: 'PEN',
      monto_prestamo: 135000.00,
      tcea: 14.5,
      cuota_fija: 1850.50,
      plazoMeses: 120
    },
    {
      simulacion_id: 102,
      fecha_registro: new Date('2025-11-22T15:30:00'),
      clienteId: 2,
      viviendaId: 2,
      moneda: 'USD',
      monto_prestamo: 108000.00,
      tcea: 13.8,
      cuota_fija: 1420.00,
      plazoMeses: 180
    }
  ];

  constructor() { }

  // --- MÉTODOS PARA CLIENTES ---

  getClients(): Observable<Client[]> {
    return of([...this.clients]).pipe(delay(300));
  }

  addClient(client: Client): Observable<boolean> {
    client.cliente_id = this.clients.length + 1;
    this.clients.push(client);
    return of(true).pipe(delay(300));
  }

  deleteClient(id: number): Observable<boolean> {
    this.clients = this.clients.filter(c => c.cliente_id !== id);
    return of(true).pipe(delay(300));
  }

  // --- MÉTODOS PARA INMUEBLES (VIVIENDAS) ---

  getHouses(): Observable<RealEstate[]> {
    return of([...this.houses]).pipe(delay(300));
  }

  addHouse(house: RealEstate): Observable<boolean> {
    house.vivienda_id = this.houses.length + 1;
    this.houses.push(house);
    return of(true).pipe(delay(300));
  }

  // --- MÉTODOS PARA SIMULACIONES ---

  /**
   * Guarda una nueva simulación en el "backend" falso.
   */
  saveSimulation(config: any, result: SimulationResult): Observable<boolean> {
    const newSim = {
      simulacion_id: this.simulations.length + 100 + 1, // ID simulado incremental
      fecha_registro: new Date(),
      // Guardamos la configuración del formulario
      ...config,
      // Guardamos los resultados calculados
      cuota_fija: result.cuotaFijaPromedio,
      tcea: result.tcea,
      van: result.van,
      tir_anual: result.tir,
      monto_prestamo: result.montoPrestamo,
      cronograma: result.cronograma
    };

    // Agregamos al inicio o usamos push y luego ordenamos al leer
    this.simulations.push(newSim);
    console.log('✅ Simulación guardada en Mock DB:', newSim);

    return of(true).pipe(delay(600));
  }

  /**
   * Obtiene el historial de simulaciones guardadas.
   * Enriquece la data cruzando IDs con los nombres de Clientes y Proyectos.
   */
  getSimulations(): Observable<any[]> {
    // Mapeamos las simulaciones para agregar nombres legibles
    const enrichedSimulations = this.simulations.map(sim => {
      const client = this.clients.find(c => c.cliente_id == sim.clienteId);
      const house = this.houses.find(h => h.vivienda_id == sim.viviendaId);

      return {
        ...sim,
        nombreCliente: client ? `${client.nombres} ${client.apellidos}` : 'Cliente Desconocido',
        nombreProyecto: house ? house.proyecto : 'Inmueble Desconocido'
      };
    });

    return of(enrichedSimulations).pipe(delay(300));
  }
}
