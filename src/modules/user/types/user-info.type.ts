import { user } from '@prisma/client';
export type SafeUser = Omit<user, 'password' | 'salt'>;
