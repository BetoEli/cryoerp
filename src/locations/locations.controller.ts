import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationQueryDto } from './dto/location-query.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponseDto } from './dto/location-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiCookieAuth('access_token')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new storage location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully.',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  create(
    @Body() createLocationDto: CreateLocationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.locationsService.create(createLocationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all storage locations for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of locations retrieved successfully.',
    type: [LocationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  findAll(@Query() query: LocationQueryDto, @CurrentUser() user: JwtPayload) {
    return this.locationsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single storage location by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Location retrieved successfully.',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Location not found.', type: ErrorResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.locationsService.findOne(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a storage location' })
  @ApiParam({ name: 'id', type: Number, description: 'Location ID' })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully.',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Location not found.', type: ErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.locationsService.update(+id, updateLocationDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a storage location' })
  @ApiParam({ name: 'id', type: Number, description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Location not found.', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Location still has inventory items.', type: ErrorResponseDto })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.locationsService.remove(+id, user.id);
  }
}
