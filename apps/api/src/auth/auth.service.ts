import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

// Define the exact shape of the returned user to eliminate 'any'
interface SafeUser {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    // Securely compare the provided password against the stored bcrypt hash
    if (user && await bcrypt.compare(pass, user.password)) {
      // Tell the linter we are purposefully extracting password to throw it away
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      
      // Cast the result to our safe interface so downstream methods know its exact shape
      return result as SafeUser;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    // The linter now knows exactly what properties exist on 'user'
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // The "sub" (subject) is standard JWT naming for the user ID
    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}