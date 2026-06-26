import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZonesService } from './zones.service';

@ApiTags('zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  findAll() {
    return this.zonesService.findAllZones();
  }

  // Static sub-routes MUST be declared before /:id to avoid shadowing
  @Get('dfps')
  findAllDfps() {
    return this.zonesService.findAllDfps();
  }

  @Get('dfps/nearest')
  findNearestDfp(@Query('lng') lng: string, @Query('lat') lat: string) {
    return this.zonesService.findNearestDfp(Number(lng), Number(lat));
  }

  @Post('dfps')
  createDfp(@Body() body: {
    name: string; phone: string; kind: string; zoneId: string; locationPingIntervalMinutes?: number;
  }) {
    return this.zonesService.createDfp(body);
  }

  @Patch('dfps/:id')
  updateDfp(
    @Param('id') id: string,
    @Body() body: { name?: string; phone?: string; kind?: string; active?: boolean; locationPingIntervalMinutes?: number },
  ) {
    return this.zonesService.updateDfp(id, body);
  }

  @Post('dfps/:id/location')
  reportLocation(
    @Param('id') id: string,
    @Body() body: { longitude: number; latitude: number },
  ) {
    return this.zonesService.reportDfpLocation(id, body.longitude, body.latitude);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonesService.findZone(id);
  }

  @Patch(':id')
  updateZone(
    @Param('id') id: string,
    @Body() body: { name?: string; defaultSlaHours?: number },
  ) {
    return this.zonesService.updateZone(id, body);
  }
}
