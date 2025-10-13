# 🚀 TalentFlow - Pipeline de Candidatos e Agendamento de Entrevistas

Sistema full-stack multi-tenant para gerenciamento de pipeline de recrutamento e agendamento de entrevistas, com autenticação JWT, RBAC e observabilidade completa.

## 📋 Tecnologias

### Backend
- **NestJS 10+** - Framework Node.js progressivo
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL 15** - Banco de dados relacional
- **Redis 7** - Cache e gerenciamento de sessões
- **Passport JWT** - Autenticação e autorização
- **Swagger/OpenAPI** - Documentação interativa da API
- **Winston** - Logs estruturados em JSON
- **Jest** - Framework de testes
- **bcrypt** - Hash de senhas

### Frontend
- **Next.js 14+** - React Framework com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **React Query (TanStack Query)** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP com interceptors
- **React Hook Form** - Gerenciamento de formulários

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **PgAdmin** - Interface de administração PostgreSQL

## 🏗️ Arquitetura

```
TalentFlow/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Módulos de domínio
│   │   │   ├── auth/          # Autenticação JWT
│   │   │   ├── tenants/       # Multi-tenant
│   │   │   ├── users/         # Usuários e RBAC
│   │   │   ├── jobs/          # Vagas
│   │   │   ├── candidates/    # Candidatos
│   │   │   └── interviews/    # Entrevistas
│   │   ├── common/            # Guards, Filters, Interceptors
│   │   ├── config/            # Configurações
│   │   └── database/          # Migrations e Seeds
│   └── test/                  # Testes E2E
├── frontend/                   # App Next.js
│   ├── src/
│   │   ├── app/               # App Router (Next.js 14)
│   │   ├── components/        # Componentes React
│   │   ├── lib/               # Utilitários e configurações
│   │   └── hooks/             # Custom hooks
└── docker-compose.yml         # Orquestração de containers
```

## ✨ Funcionalidades

### Autenticação e Autorização
- ✅ Login com JWT
- ✅ RBAC (Role-Based Access Control) - Admin, Recruiter, Manager
- ✅ Multi-tenant com isolamento de dados por organização
- ✅ Refresh token strategy

### Gestão de Vagas
- ✅ CRUD completo de vagas
- ✅ Filtros por status e departamento
- ✅ Paginação cursor-based eficiente
- ✅ Controle de acesso por roles

### Pipeline de Candidatos
- ✅ CRUD de candidatos
- ✅ Pipeline de status (Applied → Screening → Interview → Offer → Hired/Rejected)
- ✅ Associação candidato ↔ vaga
- ✅ Filtros e busca avançada

### Agendamento de Entrevistas
- ✅ CRUD de entrevistas
- ✅ Mock de integração com calendário
- ✅ Geração de links únicos
- ✅ Controle de status (Scheduled, Completed, Cancelled)

### Observabilidade
- ✅ Logs estruturados em JSON com Winston
- ✅ Request ID único por requisição
- ✅ Métricas de requisições HTTP
- ✅ Health check endpoint
- ✅ Tratamento global de erros

### Documentação
- ✅ Swagger UI interativo
- ✅ Schemas de request/response
- ✅ Autenticação JWT no Swagger

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose
- npm ou yarn

### 1. Clonar e configurar

```bash
# Clonar repositório
git clone https://github.com/Zeduh/TalentFlow.git
cd TalentFlow

# Copiar arquivos de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Iniciar infraestrutura

```bash
# Subir PostgreSQL, Redis e PgAdmin
docker-compose up -d

# Verificar se os containers estão rodando
docker-compose ps
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Executar seed (popular banco com dados iniciais)
npm run seed

# Iniciar em modo desenvolvimento
npm run start:dev
```

**Backend disponível:**
- API: http://localhost:3001
- Swagger: http://localhost:3001/docs
- Health: http://localhost:3001/health
- Metrics: http://localhost:3001/metrics

### 4. Iniciar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

**Frontend disponível:** http://localhost:3000

## 🔐 Dados de Acesso (Seed)

Após executar o seed, você pode usar estas credenciais para testar:

### Organização Alpha
- **Admin:** admin.alpha@empresa.com / admin123
- **Recruiter:** recruiter.alpha@empresa.com / recruiter123
- **Manager:** manager.alpha@empresa.com / manager123

### Organização Beta
- **Admin:** admin.beta@empresa.com / admin123
- **Recruiter:** recruiter.beta@empresa.com / recruiter123
- **Manager:** manager.beta@empresa.com / manager123

## 📚 Documentação API

### Swagger UI Interativo
Acesse: **http://localhost:3001/docs**

### Principais Endpoints

#### Autenticação
- `POST /api/v1/auth/login` - Login e geração de JWT
- `POST /api/v1/auth/register` - Registro de novo usuário

#### Vagas
- `GET /api/v1/jobs` - Listar vagas (com filtros e paginação)
- `POST /api/v1/jobs` - Criar vaga
- `GET /api/v1/jobs/:id` - Detalhar vaga
- `PUT /api/v1/jobs/:id` - Atualizar vaga
- `DELETE /api/v1/jobs/:id` - Remover vaga

#### Candidatos
- `GET /api/v1/candidates` - Listar candidatos
- `POST /api/v1/candidates` - Criar candidato
- `GET /api/v1/candidates/:id` - Detalhar candidato
- `PUT /api/v1/candidates/:id` - Atualizar candidato (incluindo status)
- `DELETE /api/v1/candidates/:id` - Remover candidato

#### Entrevistas
- `GET /api/v1/interviews` - Listar entrevistas
- `POST /api/v1/interviews` - Agendar entrevista
- `GET /api/v1/interviews/:id` - Detalhar entrevista
- `PUT /api/v1/interviews/:id` - Atualizar entrevista
- `DELETE /api/v1/interviews/:id` - Remover entrevista

## 🗄️ Banco de Dados

### Acesso via PgAdmin
- **URL:** http://localhost:5050
- **Email:** admin@talentflow.com
- **Senha:** admin123

### Conectar ao PostgreSQL via PgAdmin
1. Add New Server
2. General → Name: TalentFlow
3. Connection:
   - Host: postgres
   - Port: 5432
   - Database: talentflow_db
   - Username: talentflow
   - Password: talentflow123

### Estrutura do Banco

```sql
-- Principais tabelas
tenant          -- Organizações (multi-tenant)
user            -- Usuários com roles
job             -- Vagas abertas
candidate       -- Candidatos no pipeline
interview       -- Entrevistas agendadas
```

## 🧪 Testes

### Backend

```bash
cd backend

# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

### Frontend

```bash
cd frontend

# Testes unitários
npm run test

# Testes com watch mode
npm run test:watch
```

## 🔐 Segurança

### Implementações de Segurança
- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ JWT com expiração configurável
- ✅ Guards de autenticação em todas rotas protegidas
- ✅ RBAC para controle de acesso granular
- ✅ Validação de entrada com class-validator
- ✅ Sanitização de dados
- ✅ CORS configurado
- ✅ Rate limiting (planejado)

### Variáveis de Ambiente Sensíveis
- `JWT_SECRET` - Chave secreta para assinatura de tokens
- `DATABASE_PASSWORD` - Senha do banco de dados

## 🏢 Multi-tenant

O sistema implementa multi-tenancy a nível de aplicação:

1. Cada organização (tenant) possui um `organizationId` único
2. O `organizationId` é extraído automaticamente do JWT
3. Todas as queries incluem filtro por `organizationId`
4. Isolamento completo de dados entre tenants

## 📊 Observabilidade

### Logs Estruturados
```json
{
  "level": "info",
  "message": "Request processed",
  "context": "JobController",
  "requestId": "uuid-v4",
  "userId": "uuid",
  "organizationId": "uuid",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

### Métricas
Endpoint `/metrics` expõe:
- Total de requisições por rota
- Tempo de resposta
- Status codes
- Uptime do sistema

### Health Check
Endpoint `/health` retorna:
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T10:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run start          # Iniciar aplicação
npm run start:dev      # Modo desenvolvimento (watch)
npm run start:debug    # Modo debug
npm run start:prod     # Modo produção
npm run build          # Build da aplicação
npm run test           # Executar testes
npm run test:watch     # Testes em watch mode
npm run test:cov       # Cobertura de testes
npm run test:e2e       # Testes E2E
npm run seed           # Popular banco com dados iniciais
npm run lint           # Linter
npm run format         # Formatar código
```

### Frontend
```bash
npm run dev            # Servidor desenvolvimento
npm run build          # Build para produção
npm run start          # Iniciar build de produção
npm run lint           # Linter
npm run test           # Executar testes
```

## 📄 Licença

Este projeto está sob a licença GNU General Public License v3.0. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **José Eduardo** - [@Zeduh](https://github.com/Zeduh)

---

**Desenvolvido com ❤️ por José Eduardo**