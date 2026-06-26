import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';

@ApiTags('system-config')
@Controller('system-config')
export class SystemConfigController {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  @Get()
  async findAll(@Query('group') group?: string): Promise<SystemConfig[]> {
    const all = await this.configRepo.find({ order: { group: 'ASC', key: 'ASC' } });
    const result = group ? all.filter((c) => c.group === group) : all;
    // Mask sensitive values
    return result.map((c) =>
      c.sensitive ? { ...c, value: c.value ? '••••••••' : null } : c,
    );
  }

  @Put(':key')
  async upsert(
    @Param('key') key: string,
    @Body() body: { value: string | null; group?: string; label?: string; sensitive?: boolean },
  ): Promise<SystemConfig> {
    const existing = await this.configRepo.findOne({ where: { key } });
    if (existing) {
      await this.configRepo.update(key, {
        value: body.value,
        group: body.group ?? existing.group,
        label: body.label ?? existing.label,
        sensitive: body.sensitive ?? existing.sensitive,
      });
    } else {
      await this.configRepo.save(
        this.configRepo.create({
          key,
          value: body.value,
          group: body.group ?? null,
          label: body.label ?? null,
          sensitive: body.sensitive ?? false,
        }),
      );
    }
    const saved = (await this.configRepo.findOne({ where: { key } }))!;
    return saved.sensitive && saved.value ? { ...saved, value: '••••••••' } : saved;
  }
}
