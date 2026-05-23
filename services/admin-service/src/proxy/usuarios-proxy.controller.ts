import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  root(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.proxyService.getAuthBaseUrl());
  }

  @All('*')
  wildcard(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.proxyService.getAuthBaseUrl());
  }
}
