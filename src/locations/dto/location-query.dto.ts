import { IsEnum, IsOptional } from 'class-validator';
import { LocationType } from '../enums/location-type.enum';

export class LocationQueryDto {
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;
}