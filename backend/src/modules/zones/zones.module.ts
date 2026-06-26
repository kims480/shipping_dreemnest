import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from './entities/zone.entity';
import { Dfp } from './entities/dfp.entity';
import { ZonesService } from './zones.service';
import { ZonesController } from './zones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, Dfp])],
  providers: [ZonesService],
  controllers: [ZonesController],
  exports: [ZonesService, TypeOrmModule],
})
export class ZonesModule {}
