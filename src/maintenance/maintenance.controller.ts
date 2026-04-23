import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { SetMaintenanceStatusDto } from './dto/set-maintenance-status.dto';
import { MaintenanceStatusResponseDto } from './dto/maintenance-status-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { MaintenanceApiKeyGuard } from './guards/maintenance-api-key.guard';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get the current maintenance status' })
  @ApiResponse({
    status: 200,
    description: 'Current maintenance status retrieved successfully.',
    type: MaintenanceStatusResponseDto,
  })
  getStatus(): MaintenanceStatusResponseDto {
    return this.maintenanceService.getStatus();
  }

  @Public()
  @Post('status')
  @UseGuards(MaintenanceApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Update the maintenance status (requires maintenance API key)',
  })
  @ApiBody({ type: SetMaintenanceStatusDto, description: 'Maintenance mode to set' })
  @ApiResponse({
    status: 201,
    description: 'Maintenance status updated successfully.',
    type: MaintenanceStatusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid maintenance API key.',
    type: ErrorResponseDto,
  })
  setStatus(
    @Body() dto: SetMaintenanceStatusDto,
  ): MaintenanceStatusResponseDto {
    return this.maintenanceService.setStatus(
      dto.mode,
      dto.reason,
      dto.scheduledStartTime,
    );
  }
}
