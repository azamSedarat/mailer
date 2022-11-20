import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: String })
  email: string;

  @Prop()
  password: number;

  @Prop({ type: Object })
  otp: {
    code: string;
    expire: Date;
  };

  @Prop({ type: Boolean, default: false })
  verified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
