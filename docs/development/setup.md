# Development Setup Guide

Complete guide for setting up a local development environment for Kair0s.

## 🛠️ Prerequisites

### Required Software

#### Core Development Tools
- **Node.js** 22.12.0+ (LTS version recommended)
- **pnpm** 10.23.0+ (package manager)
- **Git** 2.30+ (version control)
- **VS Code** (recommended IDE)

#### Optional Tools
- **Docker** 20.10+ (for containerized development)
- **PostgreSQL** 15+ (local database)
- **Redis** 7+ (caching)
- **Rust** 1.70+ (desktop app development)

### VS Code Extensions

Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-git-graph"
  ]
}
```

## 🚀 Quick Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/kair0s.git
cd kair0s

# Add upstream remote
git remote add upstream https://github.com/adam-guerin/kair0s.git

# Verify remotes
git remote -v
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm --version
node --version
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
code .env
```

#### Development Environment Variables

```bash
# Development Configuration
NODE_ENV=development
PORT=5173
HOST=localhost

# Database (local development)
DATABASE_URL=postgresql://kair0s:password@localhost:5432/kair0s_dev
REDIS_URL=redis://localhost:6379

# API Keys (get from providers)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Development Services
OPENCLAW_API_URL=http://localhost:8080
PLUELY_API_URL=http://localhost:3000

# Development Features
LOG_LEVEL=debug
ENABLE_HOT_RELOAD=true
ENABLE_SOURCE_MAPS=true

# Testing
TEST_DATABASE_URL=postgresql://kair0s:password@localhost:5432/kair0s_test
```

### 4. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Install PostgreSQL (Windows)
# Download from https://www.postgresql.org/download/windows/

# Create databases
sudo -u postgres psql
CREATE DATABASE kair0s_dev;
CREATE DATABASE kair0s_test;
CREATE USER kair0s WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE kair0s_dev TO kair0s;
GRANT ALL PRIVILEGES ON DATABASE kair0s_test TO kair0s;
\q

# Run migrations
pnpm db:migrate
pnpm db:seed
```

#### Option B: Docker Database

```bash
# Create docker-compose.dev.yml
cat > docker-compose.dev.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kair0s_dev
      POSTGRES_USER: kair0s
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:
EOF

# Start services
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
pnpm db:migrate
```

### 5. Start Development Server

```bash
# Start all services
pnpm dev

# Or start specific services
pnpm dev:ui      # Web interface only
pnpm dev:api     # API server only
pnpm dev:gateway # OpenClaw gateway
```

## 🏗️ Project Structure

```
kair0s/
├── src/
│   ├── ui/                    # React UI components
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # UI utilities
│   │   └── styles/           # CSS and styling
│   ├── services/             # Business logic services
│   ├── integration/          # External service integrations
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Shared utilities
│   ├── config/               # Configuration files
│   ├── hooks/                # Custom hooks
│   ├── tests/                # Test files
│   └── main.tsx             # Application entry point
├── src-tauri/               # Desktop app (Rust)
├── docs/                    # Documentation
├── scripts/                 # Build and utility scripts
├── tests/                   # Integration and E2E tests
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation
```

## 🧪 Development Workflow

### 1. Create Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Changes

#### Code Style Guidelines

```typescript
// ✅ Good TypeScript code
interface UserConfig {
  id: string;
  name: string;
  preferences: UserPreferences;
}

export class UserService {
  constructor(private config: UserConfig) {}

  async getUser(id: string): Promise<User> {
    const user = await this.findUser(id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    return user;
  }

  private async findUser(id: string): Promise<User | null> {
    // Implementation
    return null;
  }
}

// ✅ Good React component
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### File Naming Conventions

```
# Components
UserProfile.tsx          # React component
UserProfile.test.tsx     # Component tests
UserProfile.stories.tsx  # Storybook stories

# Services
userService.ts          # Service class
userService.test.ts      # Service tests

# Utilities
formatDate.ts           # Utility function
formatDate.test.ts      # Utility tests

# Types
userTypes.ts           # Type definitions
```

### 3. Testing

#### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test userService.test.ts

# Run tests with coverage
pnpm test --coverage

# Run E2E tests
pnpm test:e2e

# Run integration tests
pnpm test:integration
```

#### Write Tests

```typescript
// Example unit test
import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './userService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService({
      id: 'test',
      name: 'Test User',
      preferences: {}
    });
  });

  it('should return user when found', async () => {
    const user = await userService.getUser('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });

  it('should throw error when user not found', async () => {
    await expect(userService.getUser('invalid'))
      .rejects.toThrow('User invalid not found');
  });
});
```

#### Component Testing

```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply correct variant class', () => {
    render(<Button variant="secondary" onClick={() => {}}>Click</Button>);
    expect(screen.getByText('Click')).toHaveClass('btn-secondary');
  });
});
```

### 4. Linting and Formatting

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm type-check

# Run all checks
pnpm check
```

#### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

#### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Check pre-commit hooks
pnpm pre-commit

# Commit with conventional message
git commit -m "feat: add user authentication service"

# Push to your fork
git push origin feature/your-feature-name
```

#### Commit Message Convention

```
feat: add new feature
fix: fix bug in existing feature
docs: update documentation
style: code formatting changes
refactor: code refactoring
test: add or update tests
chore: build process or auxiliary tool changes

# Examples
feat(auth): add JWT token validation
fix(api): handle null response from OpenAI
docs(readme): update installation instructions
```

## 🔧 Development Tools

### 1. VS Code Configuration

#### Recommended Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Kair0s",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.tsx",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### 2. Git Hooks

#### Husky Configuration

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "pnpm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 3. Database Tools

#### Prisma Studio

```bash
# Open database browser
pnpm db:studio

# Reset database
pnpm db:reset

# Seed database
pnpm db:seed
```

#### Migration Commands

```bash
# Create new migration
pnpm db:migrate create add_user_table

# Run migrations
pnpm db:migrate

# Rollback migration
pnpm db:migrate rollback
```

## 🚀 Advanced Development

### 1. Hot Module Replacement

The development server supports HMR for:

- React components
- CSS styles
- TypeScript code
- Configuration files

### 2. Source Maps

Source maps are enabled in development for easier debugging:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: process.env.NODE_ENV === 'development'
  }
});
```

### 3. Environment Variables

Development-specific environment variables:

```bash
# Enable debug logging
DEBUG=kair0s:*

# Enable hot reload
VITE_HMR=true

# Enable source maps
VITE_SOURCE_MAP=true

# Mock external services
VITE_MOCK_SERVICES=true
```

### 4. Mock Services

For development without external dependencies:

```typescript
// src/mocks/openai.ts
export const mockOpenAI = {
  chat: {
    create: async (request: ChatRequest) => ({
      id: 'mock-response',
      message: 'This is a mock response',
      usage: { prompt_tokens: 10, completion_tokens: 5 }
    })
  }
};
```

## 📊 Performance Development

### 1. Profiling

```bash
# Profile CPU usage
node --prof src/main.tsx

# Profile memory usage
node --inspect src/main.tsx

# Analyze bundle size
pnpm build --analyze
```

### 2. Benchmarking

```typescript
// Example benchmark
import { bench } from 'vitest';

bench('UserService.getUser', async () => {
  const service = new UserService(config);
  await service.getUser('123');
}, {
  iterations: 1000,
  time: 1000
});
```

### 3. Memory Leaks

```typescript
// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
}, 5000);
```

## 🐛 Debugging

### 1. Common Issues

#### Port Conflicts

```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Use different port
PORT=5174 pnpm dev
```

#### Database Connection

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U kair0s -d kair0s_dev

# Reset database
pnpm db:reset
```

#### Dependency Issues

```bash
# Clear cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Update dependencies
pnpm update
```

### 2. Debug Tools

#### Chrome DevTools

```typescript
// Add debug points
console.log('Debug point 1', { data });

// Use debugger statement
debugger;

// Performance monitoring
console.time('operation');
// ... code
console.timeEnd('operation');
```

#### VS Code Debugger

```typescript
// Set breakpoints in VS Code
// Use debug panel to inspect variables
// Step through code execution
```

## 📚 Learning Resources

### 1. Codebase Navigation

- **Start with**: `src/main.tsx` - Application entry point
- **UI Components**: `src/ui/components/` - Reusable components
- **Services**: `src/services/` - Business logic
- **Types**: `src/types/` - TypeScript definitions

### 2. Understanding the Architecture

1. **Read the architecture documentation**: `docs/architecture.md`
2. **Study the API documentation**: `docs/api.md`
3. **Review existing components**: `src/ui/components/`
4. **Examine test files**: `src/tests/`

### 3. Contributing Guidelines

- **Follow the code style**: ESLint + Prettier
- **Write tests**: Unit + integration tests
- **Update documentation**: README + API docs
- **Use conventional commits**: feat/fix/docs/etc.

## 🆘 Getting Help

### Development Support

- **GitHub Discussions**: [Ask questions](https://github.com/adam-guerin/kair0s/discussions)
- **GitHub Issues**: [Report bugs](https://github.com/adam-guerin/kair0s/issues)
- **Discord**: [Live chat](https://discord.gg/kair0s)
- **Email**: dev-support@kair0s.com

### Common Questions

1. **How do I add a new AI provider?**
   - See `src/integrations/` for examples
   - Follow the provider interface pattern

2. **How do I add a new UI component?**
   - Create in `src/ui/components/`
   - Add tests in `src/tests/`
   - Export in `src/ui/components/index.ts`

3. **How do I debug API issues?**
   - Check network tab in browser
   - Enable debug logging
   - Use API documentation

---

**Happy coding! 🚀**

---

**Last updated: February 25, 2024**
