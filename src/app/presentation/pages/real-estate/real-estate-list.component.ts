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

  selectedHouseId: string | null = null;

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
    this.selectedHouseId = null;
    this.houseForm.reset({ totalArea: 0, builtArea: 0, price: 0 });
  }

  editHouse(house: RealEstate) {
    this.isModalOpen = true;
    this.selectedHouseId = house.houseId || null;
    this.houseForm.patchValue({
      project: house.project,
      propertyCode: house.propertyCode,
      totalArea: house.totalArea,
      builtArea: house.builtArea,
      location: house.location,
      price: house.price
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedHouseId = null;
    this.houseForm.reset();
  }

  saveHouse() {
    if (this.houseForm.valid) {
      this.isLoading = true;
      const houseData: RealEstate = this.houseForm.value;

      if (this.selectedHouseId) {
        this.houseService.updateHouse(this.selectedHouseId, houseData).subscribe({
          next: () => {
            this.loadHouses();
            this.closeModal();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error actualizando inmueble:', err);
            this.isLoading = false;
          }
        });
      } else {
        this.houseService.createHouse(houseData).subscribe({
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
      }
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
