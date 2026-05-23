import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CatalogClient } from './catalog.client';
import { RealtimeClient } from './realtime.client';
import { TablesClient } from './tables.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 3,
    }),
  ],
  providers: [CatalogClient, TablesClient, RealtimeClient],
  exports: [CatalogClient, TablesClient, RealtimeClient, HttpModule],
})
export class ClientsModule {}
