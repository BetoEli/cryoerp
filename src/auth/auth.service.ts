import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    const dummyHash = await argon2.hash('dummy-password');
    if (user) {
      const isPasswordValid = await argon2.verify(user.passwordHash, password);
      if (isPasswordValid) {
        return user;
      } else {
        throw new UnauthorizedException('Password does not match');
      }
    }
    if (!user) {
      // dummy verification to prevent timing attacks
      await argon2.verify(dummyHash, password);
      throw new UnauthorizedException('User not found');
    }
  }

  login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
