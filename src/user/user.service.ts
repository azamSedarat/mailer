import { CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { ForgotUserDto } from './dto/forgot-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const otp = {
      code: crypto.randomBytes(20).toString('hex'),
      expire: this.nextDate(3),
    };

    await this.mailService.sendMail({
      subject: 'Verify',
      body: `
      <h2>Verify</h2>
       <br>
       <a href="http://localhost:3000/user/verify/${createUserDto.email}/${otp.code}">
       Verify by click
       </a>
      `,
      to: createUserDto.email,
    });

    await this.cacheManager.set(createUserDto.email, otp.code, 180);

    const user = await this.userModel.create(createUserDto);
    await user.save();

    return user;
  }

  async verify(email: string, code: string) {
    const codeInRedis = await this.cacheManager.get(email);
    if (!codeInRedis) {
      throw new HttpException('Code expired or not found', HttpStatus.FORBIDDEN);
    }
    if (codeInRedis !== code) {
      throw new HttpException('Code invalid', HttpStatus.FORBIDDEN);
    }
    await this.cacheManager.del(email);
    await this.userModel.updateOne({
        email: email
      },
      {
        verified: true
      },
    );
  }

  async forgotPassword(forgotUserDto: ForgotUserDto) {
    const user = await this.userModel.findOne({
      email: forgotUserDto.email,
      verified: true,
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const otp = {
      code: crypto.randomBytes(20).toString('hex'),
      expire: this.nextDate(3),
    };
    // await this.userModel.updateOne(
    //   {
    //     email: forgotUserDto.email,
    //   },
    //   {
    //     otp,
    //   },
    // );

    await this.cacheManager.set(forgotUserDto.email, otp.code, 180);

    await this.mailService.sendMail({
      subject: 'Forgot Password',
      body: `
      <h2>Forgot</h2>
       <br>
       <a href="http://localhost:3000/user/forgot/${forgotUserDto.email}/${otp.code}">
       Forget by click 
       </a>
      `,
      to: forgotUserDto.email,
    });
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const codeInRedis = await this.cacheManager.get(changePasswordDto.email);
    if (!codeInRedis) {
      throw new HttpException('Code expired or not found', HttpStatus.FORBIDDEN);
    }
    if (codeInRedis !== changePasswordDto.code) {
      throw new HttpException('Code invalid', HttpStatus.FORBIDDEN);
    }
    await this.cacheManager.del(changePasswordDto.email);
    await this.userModel.updateOne(
      {
        email: changePasswordDto.email,
      },
      {
        password: changePasswordDto.newPassword,
      },
    );
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private nextDate(nextMinute: number): Date {
    const date = new Date();
    date.setMinutes(date.getMinutes() + nextMinute);
    return date;
  }
}
