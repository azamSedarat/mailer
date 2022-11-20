import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
       <a href="http://localhost:3000/user/verify/${otp.code}">
       Verify by click http://localhost:3000/verify/${otp.code}
       </a>
      `,
      to: createUserDto.email,
    });

    const user = await this.userModel.create({
      ...createUserDto,
      otp,
    });
    await user.save();

    return user;
  }

  async verify(code: string) {
    const res = await this.userModel.findOneAndUpdate(
      {
        'otp.code': code,
        'otp.expire': {
          $gt: new Date(),
        },
      },
      {
        verified: true,
        otp: null,
      },
    );
    if (!res) {
      throw new HttpException('Code invaild or expired', HttpStatus.FORBIDDEN);
    }
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
