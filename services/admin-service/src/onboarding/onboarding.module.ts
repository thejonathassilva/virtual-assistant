import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EmpresaModule } from '../empresa/empresa.module';
import { OnboardingController } from './onboarding.controller';

@Module({
  imports: [HttpModule, EmpresaModule],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
