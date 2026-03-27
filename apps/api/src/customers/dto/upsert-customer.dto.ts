import { IsEmail, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertCustomerDto {
  @IsString()
  @MaxLength(200)
  businessName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gpsLink?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsString()
  visitDay?: string;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  creditDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

