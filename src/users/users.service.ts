import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HttpResponse } from 'src/common/models/http.models';
import {
  StatusCodeClientErrorEnum,
  StatusCodeSucessEnum,
} from 'src/common/types/statusCode.types';
import { ErrorHandlerWithForHttpResponse } from 'src/settings/general-error.handler';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}
  async findAll() {
    return await this.userRepository.find();
  }
  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }
  async findUserById(id: number) {
    const response = new HttpResponse();
    try {
      const entity = await this.userRepository.findOneBy({ id });
      response.success = !!entity;
      response.message = !response.success ? 'Ops! Entity not found' : null;
      response.data = entity ?? null;
      response.statusCode = !entity
        ? StatusCodeClientErrorEnum.ClientErrorNotFound
        : StatusCodeSucessEnum.SuccessOK;
    } catch (exception) {
      ErrorHandlerWithForHttpResponse(response, exception);
    } finally {
    }
    return response;
  }
  async create(userDTO: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(User, {
        email: userDTO.email,
      });

      if (user) {
        throw new ConflictException('User already exists');
      }

      const newUser: User = queryRunner.manager.create(User, {
        name: userDTO.name,
        email: userDTO.email,
        password: userDTO.password,
      });

      const result = await queryRunner.manager.save(newUser);

      await queryRunner.commitTransaction();

      return result;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
  // async create(createUserDto: CreateUserDto) {
  //   // const user = new User();
  //   const user = User.create();

  //   // const user = User.create();
  //   await user.save();

  //   delete user.password;
  //   return user;
  // }

  async showById(id: number): Promise<User> {
    const user = await this.findOne(id);

    delete user.password;
    return user;
  }

  // async findById(id: number) {
  //   return await User.findOne(id);
  // }

  async findByEmail(email: string) {
    return await User.findOne({
      where: {
        email: email,
      },
    });
  }
}
