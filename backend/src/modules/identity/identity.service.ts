import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  zoneId?: string;
}

const SALT_ROUNDS = 10;

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  findAll(role?: UserRole): Promise<User[]> {
    const where = role ? { role } : {};
    return this.userRepo.find({ where, order: { fullName: 'ASC' } });
  }

  async updateUser(id: string, data: { fullName?: string; role?: string; zoneId?: string | null; active?: boolean }): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.role !== undefined) user.role = data.role as UserRole;
    if ('zoneId' in data) user.zoneId = data.zoneId ?? null;
    if (data.active !== undefined) user.active = data.active;
    return this.userRepo.save(user);
  }

  async register(input: RegisterInput): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: input.email } });
    if (existing) throw new ConflictException('A user with this email already exists');
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = this.userRepo.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      zoneId: input.zoneId ?? null,
    });
    return this.userRepo.save(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.active) throw new UnauthorizedException('Invalid credentials');
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const accessToken = await this.jwtService.signAsync({
      sub: user.id, email: user.email, role: user.role,
    });
    return {
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, zoneId: user.zoneId },
    };
  }
}
