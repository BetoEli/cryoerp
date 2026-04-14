import { Entity, Enum, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { Role } from "./role.enum";

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  email!: string;

  @Property()
  @Unique()
  username!: string;

  @Property({ hidden: true })
  passwordHash!: string;

  @Enum(() => Role)
  role: Role = Role.USER;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
