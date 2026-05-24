import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { QuotaService } from './quota.service';

@Module({
  imports: [HttpModule],
  providers: [QuotaService],
  exports: [QuotaService],
})
export class QuotaModule {}
