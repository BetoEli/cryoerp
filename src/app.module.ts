import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { doubleCsrfProtection } from './csrf.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    HealthModule,
    LocationsModule,
    IngredientsModule,
    InventoryModule,
    RecipesModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
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
      useClass: QueryPerformanceInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(doubleCsrfProtection)
      .exclude('api/auth/login', 'api/auth/register', 'api/auth/csrf-token')
      .forRoutes('*');
  }
}
