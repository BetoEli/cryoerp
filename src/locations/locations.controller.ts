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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationQueryDto } from './dto/location-query.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocationResponseDto } from 'test/locations.e2e-spec';
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: 201,
    description: 'The location has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  create(
    @Body() createLocationDto: CreateLocationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.locationsService.create(createLocationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations for the current user' })
  @ApiResponse({
    status: 200,
    description: 'The list of locations has been successfully retrieved.',
    type: [LocationResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  findAll(@Query() query: LocationQueryDto, @CurrentUser() user: JwtPayload) {
    return this.locationsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.locationsService.findOne(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.locationsService.update(+id, updateLocationDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.locationsService.remove(+id, user.id);
  }
}
