import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(dto: CreateUserDto & { password: string }) {
    console.log('Creating user with data:', dto.email, dto.firstName, dto.lastName);
    const existing = await this.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already registered');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        password: hashed,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }
    
    // If a new password is provided, hash it before updating
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  async updateProfile(id: string, data: any) {
    const { role, isActive, ...profileData } = data;
    return this.update(id, profileData);
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
