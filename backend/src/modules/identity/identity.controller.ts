import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IdentityService } from './identity.service';
import { UserRole } from './entities/user.entity';

interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  zoneId?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@ApiTags('identity')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.identityService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.identityService.login(dto.email, dto.password);
  }

  @Get('users')
  findAllUsers(@Query('role') role?: string) {
    return this.identityService.findAll(role as UserRole | undefined);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { fullName?: string; role?: string; zoneId?: string | null; active?: boolean },
  ) {
    return this.identityService.updateUser(id, body);
  }
}
