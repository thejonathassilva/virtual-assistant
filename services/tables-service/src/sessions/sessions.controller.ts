import { Controller, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';

@ApiTags('sessoes')
@Controller('sessoes')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Put(':id/encerrar')
  encerrar(@Param('id') id: string) {
    return this.sessionsService.closeSessionById(id);
  }
}
