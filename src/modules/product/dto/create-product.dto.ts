import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;
  description: string;
  price: number;
}
