import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RealEstateService } from '../../../infrastructure/services/real-estate.service';
import { RealEstate } from '../../../domain/models/real-estate.model';

@Component({
  selector: 'app-real-estate-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './real-estate-list.component.html'
})
export class RealEstateListComponent implements OnInit {
  houses: RealEstate[] = [];
  isModalOpen = false;
  houseForm: FormGroup;
  isLoading = false;

  private houseService = inject(RealEstateService);
  private fb = inject(FormBuilder);

  constructor() {
    this.houseForm = this.fb.group({
      project: ['', Validators.required],
      propertyCode: ['', Validators.required],
      totalArea: [0, [Validators.required, Validators.min(1)]],
      builtArea: [0, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadHouses();
  }

  loadHouses() {
    this.isLoading = true;
    this.houseService.getHouses().subscribe({
      next: (data) => {
        this.houses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando inmuebles:', err);
        this.isLoading = false;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.houseForm.reset({ totalArea: 0, builtArea: 0, price: 0 });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveHouse() {
    if (this.houseForm.valid) {
      this.isLoading = true;
      const newHouse: RealEstate = this.houseForm.value;

      this.houseService.createHouse(newHouse).subscribe({
        next: () => {
          this.loadHouses();
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error guardando inmueble:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.houseForm.markAllAsTouched();
    }
  }

  deleteHouse(id: string) {
    if (confirm('¿Estás seguro de eliminar este inmueble?')) {
      this.houseService.deleteHouse(id).subscribe({
        next: () => this.loadHouses(),
        error: (err) => console.error('Error eliminando:', err)
      });
    }
  }
}
