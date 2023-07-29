import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateUserStatDto {
  @IsNotEmpty()
  @IsInt()
  guessedLetters: number;

  @IsNotEmpty()
  @IsInt()
  mistakes: number;
}
