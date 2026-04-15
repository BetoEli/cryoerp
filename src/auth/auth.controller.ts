import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { generateCsrfToken } from 'src/csrf.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<User> {
    return this.userService.create(dto.email, dto.username, dto.password);
  }

  @Public()
  @Post('login')
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
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = generateCsrfToken(req as any, res as any);
    return { token };
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post('logout')
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
