import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { EndCustomer } from './entities/end-customer.entity';
import { Address } from './entities/address.entity';

interface CreateEndCustomerDto {
  fullName: string;
  phone: string;
  email?: string;
  address: {
    label: string;
    addressLine: string;
    city: string;
    lat?: number;
    lng?: number;
  };
}

@ApiTags('end-customers')
@Controller('end-customers')
export class EndCustomersController {
  constructor(
    @InjectRepository(EndCustomer) private readonly customerRepo: Repository<EndCustomer>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
  ) {}

  @Get()
  async search(@Query('phone') phone?: string, @Query('name') name?: string) {
    if (phone) {
      const results = await this.customerRepo.find({
        where: { phone: ILike(`%${phone}%`) },
        relations: { addresses: true },
      });
      return results;
    }
    if (name) {
      return this.customerRepo.find({
        where: { fullName: ILike(`%${name}%`) },
        relations: { addresses: true },
        take: 10,
      });
    }
    return this.customerRepo.find({ relations: { addresses: true }, take: 50, order: { createdAt: 'DESC' } });
  }

  @Post()
  async create(@Body() dto: CreateEndCustomerDto) {
    const existing = await this.customerRepo.findOne({ where: { phone: dto.phone } });
    if (existing) return existing;

    const customer = await this.customerRepo.save(
      this.customerRepo.create({ fullName: dto.fullName, phone: dto.phone, email: dto.email ?? null }),
    );

    if (dto.address) {
      await this.addressRepo.save(
        this.addressRepo.create({
          endCustomerId: customer.id,
          label: dto.address.label,
          addressLine: dto.address.addressLine,
          city: dto.address.city,
          lat: dto.address.lat ?? null,
          lng: dto.address.lng ?? null,
          isDefault: true,
        }),
      );
    }

    return this.customerRepo.findOne({ where: { id: customer.id }, relations: { addresses: true } });
  }
}
