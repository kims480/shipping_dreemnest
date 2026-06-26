import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SallaConnector } from './connectors/salla.connector';
import { SystemConfig } from './entities/system-config.entity';
import { SystemConfigController } from './system-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  providers: [SallaConnector],
  controllers: [SystemConfigController],
  exports: [SallaConnector],
})
export class IntegrationsModule {}
