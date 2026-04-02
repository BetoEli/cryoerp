import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { ApiKeyGuard } from './common/guards/api-key.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    HealthModule,
    LocationsModule,
    IngredientsModule,
    InventoryModule,
    RecipesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: QueryPerformanceInterceptor,
    },
  ],
})
export class AppModule {}
