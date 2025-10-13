import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { TenantService } from '../tenants/tenant.service';
import {
  assertUnique,
  assertEntityExists,
} from '../../common/utils/validation.util';
import { UserResponseDto } from './dto/user-response.dto';
import { toUserResponseDto } from '../../common/utils/dto-mapper.util';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tenantService: TenantService,
  ) {}

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(
      `Criando usuário: ${JSON.stringify({ ...data, password: '***' })}`,
    );

    await assertUnique(
      { findByEmail: this.findByEmail.bind(this) },
      'email',
      data.email,
    );
    await assertEntityExists(this.tenantService, data.organizationId, 'Tenant');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return toUserResponseDto(savedUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Buscando usuário por email: ${email}`);
    // Coerção de tipo explícita
    const user = (await this.userRepository.findOne({
      where: { email },
    })) as unknown as User | null;
    return user;
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    // Coerção de tipo explícita
    const user = (await this.userRepository.findOne({
      where: { id },
    })) as unknown as User | null;

    if (!user) return null;
    return toUserResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = (await this.userRepository.find()) as unknown as User[];
    return users.map((user: User) => toUserResponseDto(user));
  }

  async update(
    id: string,
    data: Partial<User>,
  ): Promise<UserResponseDto | null> {
    this.logger.log(`Atualizando usuário ${id}: ${JSON.stringify(data)}`);

    if (data.email)
      await assertUnique(
        { findByEmail: this.findByEmail.bind(this) },
        'email',
        data.email,
        id,
      );

    if (data.password) data.password = await bcrypt.hash(data.password, 10);

    if (data.organizationId)
      await assertEntityExists(
        this.tenantService,
        data.organizationId,
        'Tenant',
      );

    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: string) {
    this.logger.warn(`Removendo usuário ${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return this.userRepository.delete(id);
  }
}
