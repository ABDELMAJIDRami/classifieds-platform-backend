import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request} from '@nestjs/common';
import {UsersService} from './users.service';
import {UpdateUserDto} from './dto/update-user.dto';
import {Role} from "../auth/decorators/role.decorator";
import {RoleGuard} from "../auth/guards/role.guard";
import {AuthenticatedGuard} from "../auth/guards/authenticated.guard";

@Role('manager')
@UseGuards(AuthenticatedGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getCurrentUser(@Request() req) {
    return req.user;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log(123213123123123)
    return this.usersService.update(+id, updateUserDto);
  }
}