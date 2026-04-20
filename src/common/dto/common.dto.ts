import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetiListDto {
  @IsString({ message: 'title must be a string' })
  @IsOptional()
  title?: string;
  @Type(() => Number) // 👈 关键：强制转换字符串为数字
  @IsInt()
  @Min(1)
  @IsOptional()
  currentPage?: number = 1;
  @Type(() => Number) // 👈 关键
  @IsInt()
  @IsOptional()
  pageSize?: number = 10;
  @IsString({ message: 'sortBy must be a string' })
  @IsOptional()
  sortBy?: string = 'createdAt';
  @IsString({ message: 'sortOrder must be a string' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
