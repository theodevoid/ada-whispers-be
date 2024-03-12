import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(16)
  readonly toUsername: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  readonly messageBody: string;
}
