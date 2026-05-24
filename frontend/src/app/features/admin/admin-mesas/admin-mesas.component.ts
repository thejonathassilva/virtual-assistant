import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Mesa } from '../../../core/models';
import { MesasService } from '../../../core/services/mesas.service';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-admin-mesas',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './admin-mesas.component.html',
  styleUrl: './admin-mesas.component.scss',
})
export class AdminMesasComponent implements OnInit, OnDestroy {
  private readonly mesas = inject(MesasService);
  private readonly fb = inject(FormBuilder);

  lista = signal<Mesa[]>([]);
  qrUrls = signal<Record<string, string>>({});
  loading = signal(true);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    numero: [0, [Validators.required, Validators.min(1)]],
  });

  private objectUrls: string[] = [];

  ngOnInit(): void {
    this.carregar();
  }

  ngOnDestroy(): void {
    for (const url of this.objectUrls) {
      URL.revokeObjectURL(url);
    }
  }

  carregar(): void {
    this.loading.set(true);
    this.mesas.listar().subscribe({
      next: (m) => {
        this.lista.set(m);
        this.loading.set(false);
        this.carregarQrs(m);
      },
      error: () => this.loading.set(false),
    });
  }

  criar(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.mesas.criar(this.form.controls.numero.value).subscribe({
      next: () => {
        this.form.reset({ numero: 0 });
        this.saving.set(false);
        this.carregar();
      },
      error: () => this.saving.set(false),
    });
  }

  linkMesa(m: Mesa): string {
    return m.qr_code_url || `/mesa/${m.id}`;
  }

  baixarQr(m: Mesa): void {
    this.mesas.baixarQrcode(m.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mesa-${m.numero}-qrcode.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  private carregarQrs(mesas: Mesa[]): void {
    for (const url of this.objectUrls) {
      URL.revokeObjectURL(url);
    }
    this.objectUrls = [];
    const map: Record<string, string> = {};

    for (const m of mesas) {
      this.mesas.baixarQrcode(m.id).subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.objectUrls.push(objectUrl);
          map[m.id] = objectUrl;
          this.qrUrls.set({ ...this.qrUrls(), ...map });
        },
      });
    }
  }
}
