import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { Dfp, DfpKind } from './entities/dfp.entity';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone) private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(Dfp) private readonly dfpRepo: Repository<Dfp>,
  ) {}

  findAllZones(): Promise<Zone[]> {
    return this.zoneRepo.find({ relations: { dfps: true }, order: { name: 'ASC' } });
  }

  async findZone(id: string): Promise<Zone> {
    const zone = await this.zoneRepo.findOne({ where: { id }, relations: { dfps: true } });
    if (!zone) throw new NotFoundException(`Zone ${id} not found`);
    return zone;
  }

  async updateZone(id: string, data: { name?: string; defaultSlaHours?: number }): Promise<Zone> {
    await this.zoneRepo.update(id, data);
    return this.findZone(id);
  }

  findAllDfps(): Promise<Dfp[]> {
    return this.dfpRepo.find({ relations: { zone: true }, order: { name: 'ASC' } });
  }

  async createDfp(data: {
    name: string; phone: string; kind: string; zoneId: string; locationPingIntervalMinutes?: number;
  }): Promise<Dfp> {
    const dfp = this.dfpRepo.create({
      name: data.name,
      phone: data.phone,
      kind: data.kind as DfpKind,
      zoneId: data.zoneId,
      locationPingIntervalMinutes: data.locationPingIntervalMinutes ?? 5,
    });
    return this.dfpRepo.save(dfp);
  }

  async updateDfp(id: string, data: {
    name?: string; phone?: string; kind?: string; active?: boolean; locationPingIntervalMinutes?: number;
  }): Promise<Dfp> {
    const dfp = await this.dfpRepo.findOne({ where: { id } });
    if (!dfp) throw new NotFoundException(`DFP ${id} not found`);
    if (data.name !== undefined) dfp.name = data.name;
    if (data.phone !== undefined) dfp.phone = data.phone;
    if (data.kind !== undefined) dfp.kind = data.kind as DfpKind;
    if (data.active !== undefined) dfp.active = data.active;
    if (data.locationPingIntervalMinutes !== undefined) dfp.locationPingIntervalMinutes = data.locationPingIntervalMinutes;
    return this.dfpRepo.save(dfp);
  }

  async findNearestDfp(longitude: number, latitude: number): Promise<Dfp | null> {
    const dfps = await this.dfpRepo.find({ where: { active: true } });
    const withLocation = dfps.filter((d) => d.currentLat !== null && d.currentLng !== null);
    if (withLocation.length === 0) return null;
    return withLocation.reduce((nearest, dfp) => {
      const distNearest = haversineKm(latitude, longitude, nearest.currentLat!, nearest.currentLng!);
      const distCurrent = haversineKm(latitude, longitude, dfp.currentLat!, dfp.currentLng!);
      return distCurrent < distNearest ? dfp : nearest;
    });
  }

  async reportDfpLocation(dfpId: string, longitude: number, latitude: number): Promise<void> {
    await this.dfpRepo.update(dfpId, { currentLng: longitude, currentLat: latitude, lastLocationAt: new Date() });
  }
}
