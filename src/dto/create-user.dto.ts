import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(16)
  @Transform(({ value }) => (value as string).toLowerCase())
  readonly username: string;
}
