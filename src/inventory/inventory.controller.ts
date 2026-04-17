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
import { ApiOperation } from '@nestjs/swagger';
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory item' })
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.create(createInventoryDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items for the current user' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.findAll(user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get inventory summary for the current user' })
  summary(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.findSummary(user.id);
  }

  @Get('expiring')
  @ApiOperation({
    summary: 'Get expiring inventory items for the current user',
  })
  findExpiring(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.findExpiring(days, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory item by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.findOne(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory item' })
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inventory item' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.remove(+id, user.id);
  }
}
