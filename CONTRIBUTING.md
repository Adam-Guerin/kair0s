# Contributing to Kair0s

Thank you for your interest in contributing to Kair0s! This guide will help you get started with contributing to our AI Gateway project.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22.12.0 or higher
- **pnpm** 10.23.0 or higher
- **Rust** 1.70+ (for desktop app development)
- **Git**
- **VS Code** (recommended) with our extensions

### Setup Instructions

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/kair0s.git
   cd kair0s
   
   # Add upstream remote
   git remote add upstream https://github.com/adam-guerin/kair0s.git
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

## 📋 Development Workflow

### 1. Create a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow our [Code Standards](#code-standards)
- Write tests for your changes
- Update documentation as needed
- Keep changes small and focused

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test -- integration
pnpm test -- ui
pnpm test -- security

# Type checking
pnpm lint

# Format code
pnpm format
```

### 4. Submit Pull Request

1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create Pull Request on GitHub
3. Fill out the PR template
4. Request review from maintainers
5. Address feedback

## 🎯 Types of Contributions

### 🐛 Bug Fixes

- Check existing issues for duplicates
- Create clear, descriptive issue
- Include steps to reproduce
- Add tests that fail before fix
- Ensure all tests pass after fix

### ✨ New Features

- Open issue for discussion first
- Follow our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
- Design with user experience in mind
- Include comprehensive tests
- Update documentation

### 📚 Documentation

- Fix typos and grammatical errors
- Improve clarity and examples
- Add missing API documentation
- Create tutorials and guides

### 🧪 Testing

- Improve test coverage
- Add integration tests
- Performance testing
- Security testing

## 📝 Code Standards

### TypeScript

- Use strict TypeScript mode
- Provide type annotations for all public APIs
- Prefer interfaces over types for object shapes
- Use proper generic constraints

```typescript
// ✅ Good
interface UserConfig {
  id: string;
  name: string;
  preferences: UserPreferences;
}

function createUser(config: UserConfig): User {
  // Implementation
}

// ❌ Avoid
const createUser = (config: any) => {
  // Implementation
};
```

### React Components

- Use functional components with hooks
- Follow React naming conventions
- Provide proper TypeScript types
- Use memo for performance optimization

```typescript
// ✅ Good
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

### Testing

- Aim for 100% test coverage
- Use descriptive test names
- Test both success and failure cases
- Mock external dependencies

```typescript
// ✅ Good
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid config', async () => {
      const config = { name: 'John', email: 'john@example.com' };
      const user = await userService.createUser(config);
      
      expect(user).toBeDefined();
      expect(user.name).toBe(config.name);
    });

    it('should throw error for invalid email', async () => {
      const config = { name: 'John', email: 'invalid' };
      
      await expect(userService.createUser(config))
        .rejects.toThrow('Invalid email');
    });
  });
});
```

### File Organization

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # Business logic and API calls
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── tests/              # Test files
└── styles/             # CSS and styling
```

## 🔧 Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer"
  ]
}
```

### Git Hooks

We use Husky for pre-commit hooks:

```bash
# Pre-commit: lint and format
# Pre-push: run tests
```

### Environment Variables

Never commit sensitive data:

```bash
# ✅ Use environment variables
const apiKey = process.env.API_KEY;

# ❌ Never hardcode secrets
const apiKey = "sk-1234567890";
```

## 📊 Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: At least one maintainer review required
3. **Security Review**: For sensitive changes
4. **Approval**: Merge after approval and checks pass

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Changelog

Update `CHANGELOG.md` with:

```markdown
## [1.1.0] - 2024-02-25

### Added
- New AI provider integration
- Real-time collaboration features

### Fixed
- Memory leak in transcription service
- UI responsiveness issues

### Changed
- Improved error handling
- Updated dependencies
```

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

### Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and request features
- **Discord**: Join our community server
- **Email**: support@kair0s.com

## 🏆 Recognition

### Contributors

All contributors are recognized in:

- README.md contributors section
- Release notes
- Annual contributor highlights

### Types of Contributions

- **Code**: Features, bug fixes, tests
- **Documentation**: Guides, API docs, tutorials
- **Design**: UI/UX improvements, graphics
- **Community**: Support, moderation, outreach

## 📚 Resources

### Documentation

- [API Documentation](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [Development Setup](docs/setup.md)

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tauri Guide](https://tauri.app/)
- [Vitest Documentation](https://vitest.dev/)

## ❓ Frequently Asked Questions

### Q: How do I report a security vulnerability?
A: Please email security@kair0s.com privately. Do not open public issues.

### Q: Can I work on multiple features in one PR?
A: Prefer one feature per PR. Large changes should be split into smaller, focused PRs.

### Q: How long does review take?
A: We aim to review PRs within 48 hours. Complex changes may take longer.

### Q: What if my PR is rejected?
A: Don't be discouraged! We'll provide feedback and guidance for improvement.

---

## 🎉 Thank You!

Your contributions make Kair0s better for everyone. Whether you're fixing bugs, adding features, improving documentation, or helping others in the community, we appreciate your efforts!

**Happy Contributing! 🚀**
