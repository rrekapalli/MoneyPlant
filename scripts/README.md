# MoneyPlant Scripts System

This directory contains the scripts and configuration files for the MoneyPlant application, organized by platform and component.

## Directory Structure

```
build/
├── README.md                    # This file
├── start-application.bat        # Windows main application startup
├── start-application.sh         # Linux/Mac main application startup
├── windows/                     # Windows-specific scripts
│   ├── WINDOWS_SETUP.md        # Windows setup documentation
│   ├── start-backend.bat       # Windows backend startup
│   ├── start-frontend.bat      # Windows frontend startup
│   ├── backend/
│   │   └── setup-env.bat       # Windows backend environment setup
│   └── frontend/
│       └── setup-env.bat       # Windows frontend environment setup
└── linux/                       # Linux/Mac-specific scripts
    ├── start-backend.sh         # Linux/Mac backend startup
    ├── start-frontend.sh        # Linux/Mac frontend startup
    ├── backend/
    │   └── setup-env.sh        # Linux/Mac backend environment setup
    └── frontend/
        └── setup-env.sh        # Linux/Mac frontend environment setup
```

## Usage

### Root Level Scripts (Recommended)

The root directory contains platform-agnostic scripts that automatically detect your OS and call the appropriate platform-specific scripts:

#### Windows
```cmd
start-application.bat    # Complete application setup and startup
start-backend.bat       # Backend only
start-frontend.bat      # Frontend only
```

#### Linux/Mac
```bash
./start-application.sh  # Complete application setup and startup
./start-backend.sh      # Backend only
./start-frontend.sh     # Frontend only
```

### Direct Platform Scripts

You can also call the platform-specific scripts directly:

#### Windows
```cmd
build\start-application.bat
build\windows\start-backend.bat
build\windows\start-frontend.bat
```

#### Linux/Mac
```bash
build/start-application.sh
build/linux/start-backend.sh
build/linux/start-frontend.sh
```

## Environment Setup

### Backend Environment

The backend environment setup creates a `.env` file in the `backend/` directory with all necessary configuration:

- Database connection settings
- OAuth2 configuration (Google, Microsoft)
- JWT configuration
- CORS settings
- Trino configuration
- Application settings

### Frontend Environment

The frontend environment setup generates TypeScript environment files:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

These files are automatically generated based on the backend `.env` file.

## Platform Detection

The root-level scripts automatically detect your operating system:

- **Windows**: Detects `%OS%` environment variable
- **Linux/Mac**: Detects `$OSTYPE` environment variable

## Script Features

### Windows Scripts
- Use `mvnw.cmd` (Maven wrapper) instead of requiring global Maven installation
- Comprehensive error handling and user guidance
- Environment variable loading from `.env` files
- Prerequisites checking (Java, Node.js, npm)

### Linux/Mac Scripts
- Use `mvnw` (Maven wrapper) for consistent Maven version
- Shell-compatible environment variable handling
- Prerequisites checking (Java, Node.js, npm)
- Executable permissions automatically set

## Troubleshooting

### Common Issues

1. **Permission Denied (Linux/Mac)**
   ```bash
   chmod +x build/linux/*.sh build/linux/*/*.sh
   ```

2. **Maven Not Found**
   - The scripts use Maven wrapper (`mvnw`/`mvnw.cmd`)
   - No global Maven installation required
   - Wrapper automatically downloads correct Maven version

3. **Environment Variables Not Loading**
   - Ensure `.env` file exists in `backend/` directory
   - Run setup scripts to create environment files
   - Check file permissions and syntax

### Platform-Specific Issues

#### Windows
- See `build/windows/WINDOWS_SETUP.md` for detailed Windows setup guide
- Ensure Java and Node.js are in PATH
- Use Command Prompt or PowerShell (not Git Bash for batch files)

#### Linux/Mac
- Ensure shell scripts have execute permissions
- Use bash or compatible shell
- Check that Java and Node.js are properly installed

## Development Workflow

1. **Initial Setup**
   ```bash
   # Linux/Mac
   ./start-application.sh
   
   # Windows
   start-application.bat
   ```

2. **Daily Development**
   ```bash
   # Start backend
   ./start-backend.sh    # or start-backend.bat
   
   # Start frontend (in new terminal)
   cd frontend && npm start
   ```

3. **Environment Changes**
   - Edit `backend/.env` for backend configuration
   - Run setup scripts to regenerate frontend environment files

## Security Notes

- `.env` files contain sensitive information and are in `.gitignore`
- Never commit `.env` files to version control
- Use different credentials for development, staging, and production
- Client IDs are safe for frontend code, but client secrets should never be included

## Contributing

When adding new build scripts:

1. Create both Windows (`.bat`) and Linux/Mac (`.sh`) versions
2. Place them in the appropriate platform directory
3. Update this README with usage instructions
4. Ensure scripts are executable (Linux/Mac)
5. Test on both platforms if possible 