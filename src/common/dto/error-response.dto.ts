import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error description. A single string for most errors; an array of validation messages when the ValidationPipe rejects a request.',
    oneOf: [
      { type: 'string', example: 'Invalid email or password' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['name must be longer than or equal to 2 characters'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: 'HTTP error name',
    example: 'Bad Request',
  })
  error: string;
}
