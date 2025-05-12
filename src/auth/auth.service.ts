import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Remove password from the returned user object
    const { password: _, ...result } = user;
    return result;
  }

  async validateManager(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if the user has the manager role
    if (!user.role || user.role.name !== 'manager') {
      throw new ForbiddenException('User does not have access permissions');
    }
    
    // Remove password from the returned user object
    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto, req: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    
    // Get the member role
    const memberRole = await this.rolesService.findByName('member');
    
    if (!memberRole) {
      throw new BadRequestException('Member role not found');
    }
    
    // Create new user
    const user = await this.usersService.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: registerDto.password,
      role: memberRole,
    });
    
    // Remove password from the returned user object
    const { password: _, ...result } = user;

    // Log in the user by creating a session
    req.session.passport = {
      user: user.id
    };

    return result;
  }
}