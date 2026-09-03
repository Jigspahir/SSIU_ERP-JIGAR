import { IsNotEmpty, IsString } from 'class-validator';

export class FirebaseLoginDto {
  @IsNotEmpty({ message: 'Firebase ID Token is required.' })
  @IsString({ message: 'Firebase ID Token must be a valid string.' })
  idToken: string;
}
