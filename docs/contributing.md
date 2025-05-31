# Contribution Guidelines

Thank you for your interest in contributing to the MoneyPlant project! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an inclusive and respectful community.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/money-plant.git
   cd money-plant
   ```
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/originalowner/money-plant.git
   ```
4. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make sure your branch is up to date with the main repository:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Implement your changes
3. Write or update tests as necessary
4. Run tests locally to ensure they pass
5. Update documentation as needed
6. Commit your changes following the commit message guidelines
7. Push your branch to your fork
8. Create a pull request

## Coding Standards

- Follow the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Write clear comments and JavaDoc for public methods and classes
- Keep methods small and focused on a single responsibility
- Use proper exception handling
- Add appropriate logging

### Code Formatting

We use the Google Java Format plugin to ensure consistent code formatting:

```bash
mvn com.coveo:fmt-maven-plugin:format
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(portfolio): add ability to create multiple portfolios

- Added new endpoint for creating portfolios
- Updated validation logic
- Added tests

Closes #123
```

## Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate
2. Make sure all tests pass
3. Ensure your code follows the coding standards
4. The PR should work for all supported Java versions
5. Request a review from at least one maintainer
6. PRs require approval from at least one maintainer before merging

## Testing Guidelines

- Write unit tests for all new code
- Aim for at least 80% code coverage
- Write integration tests for API endpoints
- Test edge cases and error conditions
- Use meaningful test names that describe what is being tested

Example test naming convention:
```java
@Test
void givenValidPortfolio_whenCreatingPortfolio_thenPortfolioIsCreated() {
    // Test code
}
```

## Documentation Guidelines

- Update documentation when changing functionality
- Document all public APIs with JavaDoc
- Use OpenAPI annotations for REST endpoints
- Keep diagrams and documentation up to date
- Write documentation with the end user in mind
- Include examples where appropriate

Thank you for contributing to MoneyPlant!