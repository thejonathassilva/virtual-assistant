import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigIaProxyController } from './config-ia-proxy.controller';
import { MetricasIaProxyController } from './metricas-ia-proxy.controller';
import { ProxyService } from './proxy.service';
import { UsuariosProxyController } from './usuarios-proxy.controller';

@Module({
  imports: [HttpModule.register({ timeout: 30000 })],
  controllers: [
    UsuariosProxyController,
    ConfigIaProxyController,
    MetricasIaProxyController,
  ],
  providers: [ProxyService],
})
export class ProxyModule {}
