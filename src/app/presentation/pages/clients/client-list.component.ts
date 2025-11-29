import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../infrastructure/services/client.service';
import { Client } from '../../../domain/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  isModalOpen = false;
  clientForm: FormGroup;
  isLoading = false;
  selectedClientId: string | null = null;

  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  constructor() {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      birthDate: ['', Validators.required],
      occupation: ['', Validators.required],
      monthlyIncome: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error obteniendo clientes:', err);
        this.isLoading = false;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.selectedClientId = null;
    this.clientForm.reset({ monthlyIncome: 0 });
  }

  editClient(client: any) {
    this.isModalOpen = true;
    this.selectedClientId = client.clientId || client.id || null;

    let formattedDate = '';
    if (client.birthDate) {
      formattedDate = new Date(client.birthDate).toISOString().split('T')[0];
    }

    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      documentNumber: client.documentNumber,
      birthDate: formattedDate,
      occupation: client.occupation,
      monthlyIncome: client.monthlyIncome
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedClientId = null;
    this.clientForm.reset();
  }

  saveClient() {
    if (this.clientForm.valid) {
      this.isLoading = true;
      const formData = this.clientForm.value;
      const isoDate = new Date(formData.birthDate).toISOString();

      const clientData = {
        ...formData,
        birthDate: isoDate
      };

      const request$ = this.selectedClientId
        ? this.clientService.updateClient(this.selectedClientId, clientData)
        : this.clientService.createClient({ ...clientData, userId: '' });

      request$.subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error guardando cliente:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.clientForm.markAllAsTouched();
    }
  }

  deleteClient(id: string) {
    if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error('Error eliminando cliente:', err)
      });
    }
  }
}
