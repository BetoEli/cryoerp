import { Controller, Post } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    return this.userService.create(email, username, password);
  }

  @Public()
  @Post('login')
  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const validatedUser = await this.authService.validateUser(email, password);
    if (!validatedUser) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(validatedUser);
  }
}
