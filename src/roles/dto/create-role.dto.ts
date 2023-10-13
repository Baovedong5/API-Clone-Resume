import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'Name không được để trống' })
  @IsBoolean({ message: 'isActive có giá trị boolean' })
  isActive: string;

  @IsNotEmpty({ message: 'Name không được để trống' })
  @IsMongoId({ message: 'each permission là mông object id', each: true })
  @IsArray({ message: 'Permission có định dạng là array' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
