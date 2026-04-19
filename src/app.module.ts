import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { doubleCsrfProtection } from './csrf.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HealthModule } from './health/health.module';
import { LocationsModule } from './locations/locations.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { InventoryModule } from './inventory/inventory.module';
import mikroOrmConfig from './mikro-orm.config';
import { QueryPerformanceInterceptor } from './common/interceptors/query-performance.interceptor';
import { RecipesModule } from './recipes/recipes.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { MaintenanceInterceptor } from './maintenance/interceptors/maintenance.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    HealthModule,
    LocationsModule,
    IngredientsModule,
    InventoryModule,
    RecipesModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    MaintenanceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MaintenanceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: QueryPerformanceInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(doubleCsrfProtection)
      .exclude('auth/login', 'auth/register', 'auth/csrf-token', 'maintenance/status')
      .forRoutes('*');
  }
}
