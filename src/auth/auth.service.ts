import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Cart } from '../entities/cart.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, first_name, last_name, phone } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password_hash,
      first_name,
      last_name, 
      phone,
      role: 'customer',
    });

    const savedUser = await this.userRepository.save(user);

    // Create cart for the user
    const cart = this.cartRepository.create({ user_id: savedUser.id });
    await this.cartRepository.save(cart);

    const { password_hash: _, ...userWithoutPassword } = savedUser;

    const token = this.generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password_hash, ...userWithoutPassword } = user;

    const token = this.generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      select: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at', 'updated_at'],
    });

    return user;
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
