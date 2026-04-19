import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../user/role.enum';

export class RegisterResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({
    description: 'Role assigned to the user',
    enum: Role,
    example: Role.USER,
  })
  role: Role;

  @ApiProperty({
    description: 'Timestamp when the account was created',
    example: new Date().toISOString(),
  })
  createdAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'Login successful',
  })
  message: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'Logged out',
  })
  message: string;
}

export class ProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({
    description: 'Role assigned to the user',
    enum: Role,
    example: Role.USER,
  })
  role: Role;
}
