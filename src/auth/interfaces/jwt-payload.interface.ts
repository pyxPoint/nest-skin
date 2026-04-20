export interface IUser {
  email: string;
  password: string;
}
export interface IJwtPayload {
  email: string;
  sub: number; // 对应数据库的 id
  role: string;
}
