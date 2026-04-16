import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.create(createInventoryDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.findAll(user.id);
  }

  @Get('summary')
  summary(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.findSummary(user.id);
  }

  @Get('expiring')
  findExpiring(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.findExpiring(days, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.remove(+id, user.id);
  }
}
