import { NewVideo } from '../../graphql';
import { IsNotEmpty } from 'class-validator';

export class CreateVideoDto extends NewVideo {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  userId: string;
}
