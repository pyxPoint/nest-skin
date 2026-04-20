import { UserRole } from 'src/common/types/role.type';

export interface IUserInfo {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole; // 引用上面定义的 type
}
