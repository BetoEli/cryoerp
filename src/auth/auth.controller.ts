import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  async login(@Body() dto: LoginDto) {
    const validatedUser = await this.authService.validateUser(
      dto.email,
      dto.password,
    );
    if (!validatedUser) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(validatedUser);
  }

  @Public()
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    return { csrfToken: (req as any).csrfToken?.() ?? '' };
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Logged out' });
  }
}
