import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { produtoFotoUrl } from '../../../shared/produto-image.util';

const CATEGORIAS = [
  'entradas',
  'pratos_principais',
  'bebidas',
  'sobremesas',
] as const;

@Component({
  selector: 'app-admin-produto-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './admin-produto-form.component.html',
  styleUrl: './admin-produto-form.component.scss',
})
export class AdminProdutoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categorias = CATEGORIAS;
  produtoId = signal<string | null>(null);
  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    descricao: [''],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    categoria: ['pratos_principais' as (typeof CATEGORIAS)[number], Validators.required],
    ingredientes: [''],
    alergenos: [''],
    tags: [''],
    tempo_preparo_minutos: [10, [Validators.min(0)]],
    ativo: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.produtoId.set(id);
      this.catalog.getProduto(id).subscribe((p) => this.patchForm(p));
    }
  }

  private patchForm(p: Produto): void {
    this.form.patchValue({
      nome: p.nome,
      descricao: p.descricao ?? '',
      preco: Number(p.preco),
      categoria: p.categoria as (typeof CATEGORIAS)[number],
      ingredientes: (p.ingredientes ?? []).join(', '),
      alergenos: (p.alergenos ?? []).join(', '),
      tags: (p.tags ?? []).join(', '),
      tempo_preparo_minutos: p.tempo_preparo_minutos ?? 10,
      ativo: p.ativo,
    });
    this.previewUrl.set(produtoFotoUrl(p));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  private parseList(raw: string): string[] {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private buildPayload() {
    const v = this.form.getRawValue();
    return {
      nome: v.nome,
      descricao: v.descricao || undefined,
      preco: v.preco,
      categoria: v.categoria,
      ingredientes: this.parseList(v.ingredientes),
      alergenos: this.parseList(v.alergenos),
      tags: this.parseList(v.tags),
      tempo_preparo_minutos: v.tempo_preparo_minutos,
      ativo: v.ativo,
    };
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const payload = this.buildPayload();
    const id = this.produtoId();

    const afterSave = (produto: Produto) => {
      const file = this.selectedFile();
      if (file) {
        this.catalog.uploadFoto(produto.id, file).subscribe({
          next: () => {
            this.saving.set(false);
            this.router.navigate(['/admin/produtos']);
          },
          error: (err) => {
            this.saving.set(false);
            this.error.set(err.error?.message || 'Erro ao enviar foto');
          },
        });
      } else {
        this.saving.set(false);
        this.router.navigate(['/admin/produtos']);
      }
    };

    if (id) {
      this.catalog.updateProduto(id, payload).subscribe({
        next: afterSave,
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Erro ao salvar');
        },
      });
    } else {
      this.catalog.createProduto(payload).subscribe({
        next: (p) => {
          this.produtoId.set(p.id);
          afterSave(p);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Erro ao criar');
        },
      });
    }
  }
}
