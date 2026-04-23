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
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiCookieAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { LocationSummaryDto } from './dto/location-summary.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Inventory')
@ApiCookieAuth('access_token')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new item to inventory' })
  @ApiBody({
    type: CreateInventoryDto,
    description: 'Inventory item to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully.',
    type: InventoryItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    type: ErrorResponseDto,
  })
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.create(createInventoryDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all inventory items for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of inventory items retrieved successfully.',
    type: [InventoryItemResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    type: ErrorResponseDto,
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.findAll(user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get item counts and totals grouped by location' })
  @ApiResponse({
    status: 200,
    description: 'Inventory summary retrieved successfully.',
    type: [LocationSummaryDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    type: ErrorResponseDto,
  })
  summary(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.findSummary(user.id);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'List inventory items expiring within N days' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Look-ahead window in days (default: 7)',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'List of expiring inventory items retrieved successfully.',
    type: [InventoryItemResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    type: ErrorResponseDto,
  })
  findExpiring(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.findExpiring(days, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single inventory item by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item retrieved successfully.',
    type: InventoryItemResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.findOne(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiParam({ name: 'id', type: Number, description: 'Inventory item ID' })
  @ApiBody({
    type: UpdateInventoryDto,
    description: 'Fields to update on the inventory item',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory item updated successfully.',
    type: InventoryItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found.',
    type: ErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an inventory item' })
  @ApiParam({ name: 'id', type: Number, description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found.',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.remove(+id, user.id);
  }
}
