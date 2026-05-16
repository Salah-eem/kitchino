import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';


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
    const existing = await this.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already registered');
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.create({
          ...dto,
          password: hashed,
        });
        
        return user;
      }

  async findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true } });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}