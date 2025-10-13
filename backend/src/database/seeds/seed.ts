import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { TenantService } from '../../modules/tenants/tenant.service';
import { UserService } from '../../modules/users/user.service';
import { UserRole } from '../../modules/users/user.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const tenantService = app.get(TenantService);
  const userService = app.get(UserService);

  // Tenants
  const tenants = [{ name: 'Empresa Alpha' }, { name: 'Empresa Beta' }];

  // Definindo o tipo explícito para o array
  const createdTenants: { id: string; name: string }[] = [];
  for (const tenantData of tenants) {
    const tenant = await tenantService.create(tenantData);
    createdTenants.push(tenant);
  }

  console.log('Tenants criados:', createdTenants);

  // Usuários - apenas com as propriedades necessárias para CreateUserDto
  const users = [
    {
      name: 'Admin Alpha',
      email: 'admin.alpha@empresa.com',
      password: 'admin123', // Deixamos o hash para o service fazer
      role: UserRole.ADMIN,
      organizationId: createdTenants[0].id,
    },
    {
      name: 'Recruiter Alpha',
      email: 'recruiter.alpha@empresa.com',
      password: 'recruiter123',
      role: UserRole.RECRUITER,
      organizationId: createdTenants[0].id,
    },
    {
      name: 'Manager Alpha',
      email: 'manager.alpha@empresa.com',
      password: 'manager123',
      role: UserRole.MANAGER,
      organizationId: createdTenants[0].id,
    },
    {
      name: 'Admin Beta',
      email: 'admin.beta@empresa.com',
      password: 'admin123',
      role: UserRole.ADMIN,
      organizationId: createdTenants[1].id,
    },
    {
      name: 'Recruiter Beta',
      email: 'recruiter.beta@empresa.com',
      password: 'recruiter123',
      role: UserRole.RECRUITER,
      organizationId: createdTenants[1].id,
    },
    {
      name: 'Manager Beta',
      email: 'manager.beta@empresa.com',
      password: 'manager123',
      role: UserRole.MANAGER,
      organizationId: createdTenants[1].id,
    },
  ];

  for (const userData of users) {
    // Criando usuário usando o DTO esperado pelo service
    const user = await userService.create(userData);
    console.log('Usuário criado:', user);
  }

  console.log('Seed concluído!');
  await app.close();
}

seed().catch((err) => {
  console.error('Erro ao rodar seed:', err);
});
