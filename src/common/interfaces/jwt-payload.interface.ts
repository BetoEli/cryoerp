import { Role } from 'src/user/role.enum';

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}
