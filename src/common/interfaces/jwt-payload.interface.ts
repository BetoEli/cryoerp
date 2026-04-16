import type { Role } from '../../user/role.enum';

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}
