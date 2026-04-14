import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Role } from './role.enum';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async create(email: string, username: string, password: string) {
    const hashedPassword = await argon2.hash(password);

    if (await this.em.findOne(User, { email })) {
      throw new ConflictException('Email already exists');
    }
    if (await this.em.findOne(User, { username })) {
      throw new ConflictException('Username already exists');
    }
    const user = this.em.create(User, {
      email,
      username,
      passwordHash: hashedPassword,
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persist(user).flush();
    return user;
  }

  async findByEmail(email: string) {
    const findEmail = await this.em.findOne(User, { email });
    if (findEmail) {
      return findEmail;
    } else {
      return null;
    }
  }
}
