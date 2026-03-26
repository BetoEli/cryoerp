import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class TestEntity {
  @PrimaryKey()
  id!: number;
}
