import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LocationType } from '../enums/location-type.enum';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
