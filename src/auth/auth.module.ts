import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { ManagerStrategy } from './strategies/manager.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule.register({ session: true }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    ManagerStrategy,
    SessionSerializer,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
