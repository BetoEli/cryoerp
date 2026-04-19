import { ApiProperty } from '@nestjs/swagger';

export class LocationSummaryDto {
  @ApiProperty()
  locationId: number;

  @ApiProperty()
  locationName: string;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  totalQuantity: number;

  @ApiProperty()
  expiredCount: number;
}
