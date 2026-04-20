import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsNumber } from 'class-validator';

// PartialType 继承CreateUserDto并将所有字段设为可选
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsNumber({}, { message: 'Status must be a number!' })
  status?: number;
}
