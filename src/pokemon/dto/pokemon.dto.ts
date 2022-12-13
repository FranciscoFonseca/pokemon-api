import { IsNumber } from 'class-validator';

export class PokemonDto {
  @IsNumber()
  id: number;

  @IsNumber()
  experience: number;

  @IsNumber()
  level: number;

  attacks: number[];
}
