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
import { ApiOperation } from '@nestjs/swagger';
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  create(
    @Body() createLocationDto: CreateLocationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.locationsService.create(createLocationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations for the current user' })
  findAll(@Query() query: LocationQueryDto, @CurrentUser() user: JwtPayload) {
    return this.locationsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.locationsService.findOne(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.locationsService.update(+id, updateLocationDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.locationsService.remove(+id, user.id);
  }
}
