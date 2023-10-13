import { Injectable, BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserM, UserDocument } from './schemas/user.schema';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { email, password, name, age, gender, address, role, company } =
      createUserDto;

    const isExistEmail = await this.userModel.findOne({ email });
    if (isExistEmail) {
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }

    const hashPassword = this.hashPassword(password);

    let newUser = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newUser;
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;

    const isExistEmail = await this.userModel.findOne({ email });
    if (isExistEmail) {
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }

    const hashPassword = this.hashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: 'USER',
    });

    return newRegister;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `not found`;
    return await this.userModel
      .findOne({
        _id: id,
      })
      .select('-password')
      .populate({ path: 'role', select: { name: 1, _id: 1 } });
  }

  async findOneByUsername(username: string) {
    return await this.userModel
      .findOne({
        email: username,
      })
      .populate({ path: 'role', select: { name: 1, permission: 1 } });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    const updated = await this.userModel.updateOne(
      {
        _id: updateUserDto._id,
      },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `not found`;

    const foundUser = await this.userModel.findById(id);
    if (foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Không thể xóa tài khoản admin@gmail.com');
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.userModel.softDelete({ _id: id });
  }

  updateUserToken = async (refreshToken: string, id: string) => {
    return await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        refreshToken,
      },
    );
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken });
  };
}
