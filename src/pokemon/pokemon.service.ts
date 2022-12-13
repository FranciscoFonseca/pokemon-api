import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { Pokemon } from '../app/entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private pokemonRepository: Repository<Pokemon>,
    private readonly dataSource: DataSource,
  ) {}
  async findAll() {
    return await this.pokemonRepository.find();
  }
  async findOne(id: number): Promise<Pokemon> {
    return await this.pokemonRepository.findOneBy({ id });
  }

  async create(pokemonDTO: CreatePokemonDto): Promise<Pokemon> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pokemon = await queryRunner.manager.findOneBy(Pokemon, {
        name: pokemonDTO.name,
      });

      if (pokemon) {
        throw new ConflictException('Pokemon already exists');
      }

      const newPokemon: Pokemon = queryRunner.manager.create(Pokemon, {
        name: pokemonDTO.name,
        type: pokemonDTO.type,
        description: pokemonDTO.description,
        image: pokemonDTO.image,
        region: pokemonDTO.region,
      });
      await queryRunner.manager.save(newPokemon);
      await queryRunner.commitTransaction();
      return newPokemon;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
