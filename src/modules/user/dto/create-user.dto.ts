import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name can not be empty!' })
  name: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password can not be empty!' })
  password: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
}
