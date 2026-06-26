import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
// JobsModule (BullMQ) requires Redis ≥5; disabled until a Redis 5+ server is
// available on this machine. Re-enable by un-commenting and adding to imports[].
// import { JobsModule } from './common/jobs/jobs.module';
import { ZonesModule } from './modules/zones/zones.module';
import { OrdersModule } from './modules/orders/orders.module';
import { IdentityModule } from './modules/identity/identity.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { FulfillmentModule } from './modules/fulfillment/fulfillment.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { ProblemManagementModule } from './modules/problem-management/problem-management.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, redisConfig] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get<TypeOrmModuleOptions>('database')!,
    }),
    ZonesModule,
    OrdersModule,
    IdentityModule,
    NotificationsModule,
    TrackingModule,
    FulfillmentModule,
    AccountingModule,
    ProblemManagementModule,
    IntegrationsModule,
    AnalyticsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
