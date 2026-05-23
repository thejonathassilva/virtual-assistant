import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  entradas: 'Entradas',
  pratos_principais: 'Pratos principais',
  bebidas: 'Bebidas',
  sobremesas: 'Sobremesas',
};

@Pipe({ name: 'categoriaLabel', standalone: true })
export class CategoriaLabelPipe implements PipeTransform {
  transform(value: string): string {
    return LABELS[value] ?? value;
  }
}
