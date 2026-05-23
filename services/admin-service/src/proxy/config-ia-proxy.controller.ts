import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('config-ia')
@Controller('config-ia')
export class ConfigIaProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  root(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.proxyService.getAiBaseUrl());
  }

  @All('*')
  wildcard(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.proxyService.getAiBaseUrl());
  }
}
