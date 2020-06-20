import { Schema, SchemaTypes, model, Document } from "mongoose";
import ObjectId from "bson-objectid";
import { hash, genSalt, compare } from "bcrypt";
import { handleError, ServerError } from "../error";
import { JWT } from "../utils/jwt";
import * as _ from "underscore";
import * as mail from "nodemailer";
import { randomBytes } from "crypto";
import { promisify } from "util";

const usersSchema = new Schema({
  img: {
    type: String,
    required: false,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 52,
  },
  email: {
    required: true,
    type: String,
    unique: true,
    trim: true,
    select: false,
  },
  password: {
    required: true,
    type: String,
    trim: true,
    select: false,
  },
  skills: {
    required: true,
    type: String,
    trim: true,
  },
  jobTitle: {
    required: true,
    type: String,
    trim: true,
    maxlength: 52,
  },
  description: {
    required: true,
    type: String,
    trim: true,
  },
});

usersSchema.index({
  skills: "text",
  fullName: "text",
  jobTitle: "text",
});

const users = model("users", usersSchema);

export interface IUserBase {
  fullName: string;
  jobTitle: string;
  description: string;
  skills: string;
  img?: string | null;
}

export interface INewUser extends IUserBase {
  email: string;
  password: string;
}

export interface IUser extends IUserBase {
  userId: string;
}

export interface ILoginUser extends IUser {
  email: string;
  token: string;
}

export class Users {
  /**
   * @get users based
   */
  static async search(text: string): Promise<IUser[]> {
    try {
      return (await users.find({ $text: { $search: text } })) as any;
    } catch (error) {
      throw handleError(error, "An error occurred while searching for user");
    }
  }

  /**
   * updating info about the user
   * email and password cannot be updated
   */
  static async update(userId: string, updatedField: IUser) {
    try {
      // this will delete email and password if present in updatedField object
      delete (updatedField as any).email;
      delete (updatedField as any).password;
      return await users.findByIdAndUpdate(userId, updatedField, {
        new: true,
      });
    } catch (error) {
      throw handleError(error, "An error occurred while updating your info");
    }
  }

  /**
   * reseting password for provided
   * @param email
   * this will create a brand new password and send it to the email
   */
  static async resetPassword(email: string) {
    try {
      email = email.trim();
      const newPassword = randomBytes(4).toString("hex");
      // salting
      const salt = await genSalt();
      // replacing the password with hashed password
      const hashedPassword = await hash(newPassword, salt);
      // save the hashed password
      const user = await users.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );

      if (!user) throw new ServerError("No such user exists", 400);

      let account = await mail.createTestAccount();
      const transporter = mail.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: account.user, // generated ethereal user
          pass: account.pass, // generated ethereal password
        },
      });

      // send the password to the given email
      await promisify(transporter.sendMail)({
        sender: "noreply@workdayz.com",
        to: email,
        subject: "New Password",
        text: `Your new password is ${newPassword}`,
      });
    } catch (error) {
      throw handleError(error, "An error occurred while reseting the password");
    }
  }

  /**
   * logging in the user
   * should return jwt token
   * along with IUser
   */
  static async login(email: string, password: string): Promise<ILoginUser> {
    try {
      const user: INewUser &
        Omit<ILoginUser, "token"> &
        Document = (await users
        .findOne({ email: email.trim() }, "+password")
        .exec()) as any;

      if (!user)
        throw new ServerError("No Such user exist. Try registering", 400);

      // checking if the password is valid
      const isValid = await compare(password.trim(), user.password);
      if (!isValid) throw new ServerError("Invalid email or password", 401);

      const userDetails = user.toJSON();
      delete userDetails.password;

      // all good
      // delete the password
      const token = await JWT.sign({
        ...userDetails,
        email,
        userId: userDetails._id,
      });
      return { ...userDetails, email, token, userId: userDetails._id };
    } catch (error) {
      console.log(error);
      throw handleError(error, "Invalid email or password");
    }
  }

  /**
   * adds a new user
   * registering
   */
  static async new(info: INewUser): Promise<ILoginUser> {
    try {
      // checking if the provided email already exist
      const emailIsUsed = await users.findOne({ email: info.email.trim() });
      if (emailIsUsed) {
        throw new ServerError("Provided email is already taken", 409);
      }
      const userId = ObjectId.generate();
      const user = { ...info, _id: userId };
      // salt for password
      const salt = await genSalt();
      // replacing the password with hashed password
      user.password = await hash(user.password, salt);

      await new users(user).save();
      delete user.password;
      delete user._id;

      // user created so return with token
      const token = await JWT.sign({ ...user, userId });
      return { ...user, token, userId };
    } catch (error) {
      console.log(error);
      throw handleError(error, "An error occurred while registering user");
    }
  }
}
