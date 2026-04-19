import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
  LogoutResponseDto,
  ProfileResponseDto,
} from './dto/auth-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { generateCsrfToken } from '../csrf.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully.',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Email or username already in use.', type: ErrorResponseDto })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.userService.create(dto.email, dto.username, dto.password);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Log in and receive a session cookie' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful. Sets an httpOnly access_token cookie.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password.', type: ErrorResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const validatedUser = await this.authService.validateUser(
      dto.email,
      dto.password,
    );

    if (!validatedUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { access_token } = this.authService.login(validatedUser);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });
    return { message: 'Login successful' };
  }

  @Public()
  @Get('csrf-token')
  @ApiOperation({ summary: 'Fetch a CSRF token required for mutating requests' })
  @ApiResponse({
    status: 200,
    description: 'CSRF token returned. Send it as the x-csrf-token header.',
  })
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = generateCsrfToken(req as any, res as any);
    return { token };
  }

  @Get('profile')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get the current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  getProfile(@CurrentUser() user: ProfileResponseDto) {
    return user;
  }

  @Post('logout')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Log out and clear the session cookie' })
  @ApiResponse({
    status: 201,
    description: 'Logged out successfully.',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logged out' };
  }
}
