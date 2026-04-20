import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}
export class RegisterUserDto extends LoginUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name can not be empty!' })
  name: string;
}
