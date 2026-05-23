import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatHistoricoMsg, ChatResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private readonly http: HttpClient) {}

  enviar(mesaId: string, mensagem: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${environment.apiUrl}/chat/${mesaId}/mensagem`,
      { mensagem },
    );
  }

  /**
   * Streaming via SSE (POST). Emite chunks de texto e retorna a resposta final.
   */
  enviarStream(
    mesaId: string,
    mensagem: string,
    onChunk: (chunk: string) => void,
  ): Promise<ChatResponse> {
    const url = `${environment.apiUrl}/chat/${mesaId}/mensagem/stream`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem }),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming não suportado');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: ChatResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = JSON.parse(line.slice(6)) as {
            chunk?: string;
            done?: boolean;
            resposta?: string;
            error?: string;
          };
          if (payload.error) throw new Error(payload.error);
          if (payload.chunk) onChunk(payload.chunk);
          if (payload.done && payload.resposta) {
            finalResult = {
              resposta: payload.resposta,
              sessao_id: (payload as ChatResponse).sessao_id,
              mesa_id: (payload as ChatResponse).mesa_id,
              tool_calls: (payload as ChatResponse).tool_calls,
              metrics: (payload as ChatResponse).metrics,
            };
          }
        }
      }

      if (!finalResult) {
        throw new Error('Resposta incompleta');
      }
      return finalResult;
    });
  }

  historico(mesaId: string) {
    return this.http.get<{ mensagens: ChatHistoricoMsg[] }>(
      `${environment.apiUrl}/chat/${mesaId}/historico`,
    );
  }
}
