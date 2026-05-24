import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CatalogClient } from './catalog.client';
import { OrdersClient } from './orders.client';
import { RealtimeClient } from './realtime.client';
import { TablesClient } from './tables.client';

@Module({
  imports: [HttpModule.register({ timeout: 15000 })],
  providers: [OrdersClient, CatalogClient, RealtimeClient, TablesClient],
  exports: [OrdersClient, CatalogClient, RealtimeClient, TablesClient],
})
export class ClientsModule {}
