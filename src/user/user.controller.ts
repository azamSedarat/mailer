import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotUserDto } from './dto/forgot-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/verify/:email/:code')
  verify(@Param('email') email: string, @Param('code') code: string) {
    return this.userService.verify(email, code);
  }

  @Post('/forgot')
  forgot(@Body() forgotUserDto: ForgotUserDto) {
    return this.userService.forgotPassword(forgotUserDto);
  }

  @Get('/forgot/:code')
  changePassword(@Param('code') code: string) {
    return this.userService.changePassword({
      code: code,
      newPassword: '0000',
    });
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
