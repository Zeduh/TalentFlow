# TalentFlow
Pipeline de Candidatos e  Agendamento de Entrevistas
# 🚀 TalentFlow - Pipeline de Candidatos e Agendamento de Entrevistas

Sistema full-stack multi-tenant para gerenciamento de pipeline de recrutamento e agendamento de entrevistas.

## 📋 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **Redis** - Cache e idempotência
- **Swagger** - Documentação API
- **Winston** - Logs estruturados
- **Jest** - Testes

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query** - Cache e state management
- **Axios** - HTTP client

## 🏗️ Arquitetura

```
TalentFlow/
├── backend/          # API NestJS
├── frontend/         # App Next.js
└── docker-compose.yml
```

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

### 3. Iniciar Backend

```bash
cd backend
npm install
npm run start:dev

# API disponível em: http://localhost:3001
# Swagger em: http://localhost:3001/docs
```

### 4. Iniciar Frontend

```bash
cd frontend
npm install
npm run dev

# App disponível em: http://localhost:3000
```

## 📚 Documentação API

Acesse a documentação Swagger em: **http://localhost:3001/docs**

## 🗄️ Banco de Dados

### PgAdmin
- URL: http://localhost:5050
- Email: admin@talentflow.com
- Senha: admin123

### Conectar ao PostgreSQL via PgAdmin
- Host: postgres
- Port: 5432
- Database: talentflow_db
- Username: talentflow
- Password: talentflow123

## 🧪 Testes

```bash
# Backend
cd backend
npm run test
npm run test:e2e
npm run test:cov

# Frontend
cd frontend
npm run test
```

## 📦 Build para Produção

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Após login, o token é armazenado e enviado automaticamente em todas requisições.

## 🏢 Multi-tenant

Cada organização (tenant) possui isolamento de dados. O `organizationId` é extraído do JWT e aplicado automaticamente nas queries.

## 📊 Observabilidade

- **Logs estruturados**: JSON format com requestId
- **Métricas**: Expostas via endpoint `/metrics`
- **Health Check**: `/health`

## 📄 Licença

GNU General Public License v3.0