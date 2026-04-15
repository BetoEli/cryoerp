import type { Dictionary } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import * as argon2 from 'argon2';
import { User } from '../user/user.entity';
import { Role } from '../user/role.enum';

export class UserSeeder extends Seeder<Dictionary> {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    context.adminUser = em.create(User, {
      email: 'admin@cryoerp.test',
      username: 'admin',
      passwordHash: await argon2.hash('admin123'),
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    context.regularUser = em.create(User, {
      email: 'user@cryoerp.test',
      username: 'testuser',
      passwordHash: await argon2.hash('user123'),
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await em.flush();
  }
}
