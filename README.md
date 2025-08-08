# MoneyPlant

MoneyPlant is a financial portfolio management application that allows users to track investments, monitor stocks, and manage their financial portfolios. It is built using Spring Boot Modulith architecture.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Modules](#modules)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

MoneyPlant follows the Spring Boot Modulith architecture, which provides a modular approach to building monolithic applications. The application is structured into well-defined modules with clear boundaries, allowing for:

- **Modularity**: Each functional area is a separate module with clear boundaries
- **Testability**: Modules can be tested in isolation
- **Maintainability**: Clear separation of concerns makes the codebase easier to maintain
- **Evolvability**: Modules can evolve independently while maintaining integration

## Modules

The application is organized into the following modules:

- **core**: Common entities, repositories, and utilities shared across modules
- **stock**: Provides stock information and market data
- **portfolio**: Manages user portfolios
- **transaction**: Handles investment transactions
- **watchlist**: Manages user watchlists for tracking stocks

## Technologies

- **Java 21**: Core programming language
- **Spring Boot 3.3.0**: Application framework
- **Spring Boot Modulith**: Modular monolith architecture
- **Spring Data JPA**: Data access layer
- **PostgreSQL**: Database (configurable per environment)
- **Docker**: Containerization
- **Kubernetes**: Container orchestration (for production)
- **Resilience4j**: Circuit breaker implementation
- **OpenAPI/Swagger**: API documentation

## Prerequisites

- Java 21 or higher
- Maven 3.8 or higher
- Docker and Docker Compose (for local development)
- PostgreSQL (if running the application directly)

## Setup Instructions

### Quick Start

The project includes a comprehensive build system that handles both backend and frontend setup automatically.

#### Windows
```cmd
start-application.bat
```

#### Linux/Mac
```bash
./start-application.sh
```

These scripts will:
- Check prerequisites (Java, Node.js, npm)
- Set up environment files for both backend and frontend
- Provide next steps for configuration

### Manual Setup

#### Backend Setup

1. Set up the backend environment:
   ```bash
   # Linux/Mac
   build/linux/backend/setup-env.sh
   
   # Windows
   build\windows\backend\setup-env.bat
   ```

2. Edit the generated `backend/.env` file with your actual credentials

3. Start the backend:
   ```bash
   # Linux/Mac
   ./start-backend.sh
   
   # Windows
   start-backend.bat
   ```

#### Frontend Setup

1. Set up the frontend environment:
   ```bash
   # Linux/Mac
   build/linux/frontend/setup-env.sh
   
   # Windows
   build\windows\frontend\setup-env.bat
   ```

2. Install dependencies and start the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Building the Angular Frontend

The project includes an Angular frontend that needs to be built and deployed to the `resources/static` directory for the Spring Boot application to serve it. A convenience script is provided to automate this process:

1. Make sure the script is executable:
   ```bash
   chmod +x moneyplant-app/build-frontend.sh
   ```

2. Run the script to build the frontend and deploy it:
   ```bash
   ./moneyplant-app/build-frontend.sh
   ```

This script will:
- Install the necessary dependencies (using `--legacy-peer-deps` to handle version conflicts)
- Build the Angular application
- Copy the built files to the `resources/static` directory

After running this script, the frontend will be accessible when you start the Spring Boot application.

### Docker Image Building

The project is configured to automatically build Docker images whenever a Maven package is created. This is done using the Maven Exec Plugin, which runs a script after the package phase.

For more details, see the [Docker Image Building Guide](README-docker-images.md).

### Local Development with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-plant.git
   cd money-plant
   ```

2. Build the project:
   ```bash
   mvn clean package
   ```
   This will also build Docker images for the application automatically.

3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Application: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html

### Manual Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-plant.git
   cd money-plant
   ```

2. Build the project:
   ```bash
   mvn clean package
   ```

3. Start the application:
   ```bash
   cd moneyplant-app
   mvn spring-boot:run
   ```

## API Documentation

### Swagger UI Access

The API documentation is available through Swagger UI:

- **Application**: http://localhost:8080/swagger-ui.html

The Swagger UI provides documentation for all modules' APIs, organized by module.

### API Versioning

All APIs follow a versioned approach with the format:
```
/api/v{version_number}/{module}/{resource}
```

For more details, see the [API Versioning Strategy](docs/api-versioning-strategy.md).

## Contributing

Please read the [Contribution Guidelines](docs/contributing.md) before submitting pull requests.

## Troubleshooting

For common issues and solutions, please refer to the [Troubleshooting Guide](docs/troubleshooting.md).

