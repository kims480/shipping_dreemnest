import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dreem-nest-dev-secret'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '12h') as `${number}${'s' | 'm' | 'h' | 'd'}` },
      }),
    }),
  ],
  providers: [IdentityService, JwtStrategy, JwtAuthGuard, RolesGuard],
  controllers: [IdentityController],
  exports: [IdentityService, JwtAuthGuard, RolesGuard, TypeOrmModule],
})
export class IdentityModule {}
