import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MesasService } from '../../core/services/mesas.service';
import { AuthService } from '../../core/services/auth.service';
import { Mesa } from '../../core/models';
import { RestaurantBrandComponent } from '../../shared/restaurant-brand/restaurant-brand.component';
import { MATERIAL_IMPORTS } from '../../shared/material';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RestaurantBrandComponent, ...MATERIAL_IMPORTS],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly mesas = inject(MesasService);
  readonly auth = inject(AuthService);
  mesasList = signal<Mesa[]>([]);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.mesas.listar().subscribe({
        next: (m) => this.mesasList.set(m),
        error: () => {},
      });
    }
  }
}
