import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MesasService } from '../../../core/services/mesas.service';
import { Mesa } from '../../../core/models';
import { RestaurantBrandComponent } from '../../../shared/restaurant-brand/restaurant-brand.component';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-mesa-home',
  standalone: true,
  imports: [RouterLink, RestaurantBrandComponent, ...MATERIAL_IMPORTS],
  templateUrl: './mesa-home.component.html',
  styleUrl: './mesa-home.component.scss',
})
export class MesaHomeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mesas = inject(MesasService);

  mesa = signal<Mesa | null>(null);
  mesaId = signal('');
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('mesaId')!;
    this.mesaId.set(id);
    this.mesas.obter(id).subscribe({
      next: (m) => {
        this.mesa.set(m);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  abrirSessao(): void {
    this.mesas.abrirSessao(this.mesaId()).subscribe({
      next: (sessao: { id: string }) => {
        this.mesa.update((m) =>
          m ? { ...m, status: 'ocupada', sessao_ativa_id: sessao.id } : m,
        );
      },
    });
  }
}
