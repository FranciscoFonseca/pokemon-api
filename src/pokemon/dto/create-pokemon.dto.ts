import { IsString } from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  name: string;
  @IsString()
  type: number[];
  @IsString()
  description: string;
  @IsString()
  image: string;

  @IsString()
  region: number;
}
