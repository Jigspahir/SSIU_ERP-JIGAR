import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseRolesGuard } from './guards/firebase-roles.guard';

@Module({
  imports: [
    FirebaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('[Security Config Error] JWT_SECRET must be configured in environment variables. Application startup aborted.');
        }
        return {
          secret,
          signOptions: {
            expiresIn: config.get<string>('JWT_EXPIRATION') || '15m',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    SupabaseAuthService, 
    SupabaseAuthGuard, 
    RolesGuard, 
    PermissionsGuard,
    FirebaseAuthService,
    FirebaseAuthGuard,
    FirebaseRolesGuard
  ],
  exports: [
    AuthService, 
    JwtStrategy, 
    PassportModule, 
    SupabaseAuthService, 
    SupabaseAuthGuard, 
    RolesGuard, 
    PermissionsGuard,
    FirebaseAuthService,
    FirebaseAuthGuard,
    FirebaseRolesGuard
  ],
})
export class AuthModule {}
