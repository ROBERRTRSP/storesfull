import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateClientOrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  qty!: number;
}

export class CreateClientOrderDto {
  @IsIn(['draft', 'confirm'])
  mode!: 'draft' | 'confirm';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateClientOrderItemDto)
  items!: CreateClientOrderItemDto[];

  @IsOptional()
  @IsString()
  note?: string;
}

