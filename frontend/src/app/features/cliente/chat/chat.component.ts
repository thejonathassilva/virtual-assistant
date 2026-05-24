import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { setMesaRestauranteId } from '../../../core/interceptors/tenant.interceptor';
import { ChatService } from '../../../core/services/chat.service';
import { MesasService } from '../../../core/services/mesas.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ProdutoCatalogoStore } from '../../../core/services/produto-catalogo.store';
import { Pedido } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe } from '@angular/common';
import { produtoFotoUrl } from '../../../shared/produto-image.util';
import { RestaurantBrandComponent } from '../../../shared/restaurant-brand/restaurant-brand.component';

interface UiMsg {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, RestaurantBrandComponent, ...MATERIAL_IMPORTS],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  private readonly route = inject(ActivatedRoute);
  private readonly chat = inject(ChatService);
  private readonly mesas = inject(MesasService);
  private readonly pedidos = inject(PedidosService);
  private readonly catalogo = inject(ProdutoCatalogoStore);

  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLElement>;

  mesaId = signal('');
  mensagens = signal<UiMsg[]>([]);
  input = signal('');
  digitando = signal(false);
  pedido = signal<Pedido | null>(null);
  private shouldScroll = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('mesaId')!;
    this.mesaId.set(id);
    this.mesas.obter(id).subscribe({
      next: (m) => {
        if (m.restaurante_id) setMesaRestauranteId(m.restaurante_id);
      },
    });
    this.catalogo.ensureLoaded();
    this.chat.historico(id).subscribe({
      next: (h) => {
        const msgs = (h.mensagens || []).map((m) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }));
        if (msgs.length) {
          this.mensagens.set(msgs);
          this.shouldScroll = true;
        }
      },
    });
    this.atualizarPedido();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  nomeProduto(produtoId: string): string {
    return this.catalogo.get(produtoId)?.nome ?? 'Item';
  }

  fotoProduto(produtoId: string): string | null {
    const p = this.catalogo.get(produtoId);
    return p ? produtoFotoUrl(p) : null;
  }

  enviar(): void {
    const texto = this.input().trim();
    if (!texto || this.digitando()) return;
    this.mensagens.update((m) => [...m, { role: 'user', content: texto }]);
    this.input.set('');
    this.digitando.set(true);
    this.shouldScroll = true;

    const assistantIndex = this.mensagens().length;
    this.mensagens.update((m) => [...m, { role: 'assistant', content: '' }]);

    this.chat
      .enviarStream(this.mesaId(), texto, (chunk) => {
        this.mensagens.update((list) => {
          const copy = [...list];
          const msg = copy[assistantIndex];
          if (msg?.role === 'assistant') {
            copy[assistantIndex] = { ...msg, content: msg.content + chunk };
          }
          return copy;
        });
        this.shouldScroll = true;
      })
      .then(() => {
        this.digitando.set(false);
        this.shouldScroll = true;
        this.atualizarPedido();
      })
      .catch(() => {
        this.mensagens.update((m) => {
          const copy = [...m];
          if (copy[assistantIndex]?.role === 'assistant') {
            copy[assistantIndex] = {
              role: 'assistant',
              content: 'Desculpe, tive um problema. Tente novamente ou chame o garçom.',
            };
          }
          return copy;
        });
        this.digitando.set(false);
        this.shouldScroll = true;
      });
  }

  chamarGarcom(): void {
    this.chat.enviar(this.mesaId(), 'Preciso chamar o garçom').subscribe({
      next: (res) => {
        this.mensagens.update((m) => [...m, { role: 'assistant', content: res.resposta }]);
        this.shouldScroll = true;
      },
    });
  }

  private scrollToBottom(): void {
    const el = this.messagesEl?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  private atualizarPedido(): void {
    this.pedidos.pedidoAtualMesa(this.mesaId()).subscribe({
      next: (p) => this.pedido.set(p),
      error: () => this.pedido.set(null),
    });
  }
}
