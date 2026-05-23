import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from '../sessions/sessions.module';
import { Mesa } from './entities/mesa.entity';
import { SessaoMesa } from './entities/sessao-mesa.entity';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mesa, SessaoMesa]),
    SessionsModule,
  ],
  controllers: [MesasController],
  providers: [MesasService],
  exports: [MesasService],
})
export class MesasModule {}
