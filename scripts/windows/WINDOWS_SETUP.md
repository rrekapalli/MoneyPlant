# MoneyPlant Windows Setup Guide

This guide will help you set up and run the MoneyPlant application on Windows.

## Prerequisites

Before running the application, ensure you have the following installed:

### 1. Java Development Kit (JDK)
- **Version**: Java 17 or later
- **Download**: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
- **Installation**: Follow the installer instructions and ensure JAVA_HOME is set

### 2. Node.js and npm
- **Version**: Node.js 18 or later
- **Download**: [Node.js Official Website](https://nodejs.org/)
- **Installation**: The installer includes npm automatically

### 3. Git (Optional but Recommended)
- **Download**: [Git for Windows](https://git-scm.com/download/win)
- **Installation**: Use default settings

## Quick Start

### Option 1: Using Batch Files (Recommended)

1. **Clone or download the project**
   ```cmd
   git clone <repository-url>
   cd MoneyPlant
   ```

2. **Run the main setup script**
   ```cmd
   start-application.bat
   ```
   This will:
   - Check prerequisites
   - Set up environment files
   - Provide next steps

3. **Start the backend**
   ```cmd
   start-backend.bat
   ```

4. **Start the frontend** (in a new command prompt)
   ```cmd
   cd frontend
   npm start
   ```

### Option 2: Manual Setup

1. **Set up backend environment**
   ```cmd
   cd backend
   setup-env.bat
   ```

2. **Edit the .env file**
   - Open `backend\.env` in a text editor
   - Replace placeholder values with your actual credentials

3. **Set up frontend environment**
   ```cmd
   cd frontend
   setup-env.bat
   ```

4. **Install frontend dependencies**
   ```cmd
   cd frontend
   npm install
   ```

5. **Start the backend**
   ```cmd
   cd backend
   mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
   ```

6. **Start the frontend** (in a new command prompt)
   ```cmd
   cd frontend
   npm start
   ```

## Troubleshooting

### Issue: "mvn is not recognized as an internal or external command"

**Solution**: The project now includes Maven wrapper files (`mvnw.cmd` and `mvnw`) that allow you to run Maven without installing it globally.

- Use `mvnw.cmd` instead of `mvn` on Windows
- The batch files have been updated to automatically detect and use the wrapper

### Issue: "setup-env.bat is not found"

**Solution**: The missing batch files have been created:
- `backend\setup-env.bat` - Sets up backend environment
- `frontend\setup-env.bat` - Sets up frontend environment

### Issue: Java not found

**Solution**: 
1. Install Java 17 or later
2. Set JAVA_HOME environment variable
3. Add Java bin directory to PATH

### Issue: Node.js not found

**Solution**:
1. Install Node.js 18 or later from [nodejs.org](https://nodejs.org/)
2. Restart your command prompt after installation

### Issue: Port already in use

**Solution**:
1. Check if another application is using port 8080 (backend) or 4200 (frontend)
2. Kill the process using the port:
   ```cmd
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```

## Environment Configuration

### Backend Environment (.env file)

The backend requires several environment variables. The setup script creates a template file with the following sections:

- **Database Configuration**: PostgreSQL connection settings
- **OAuth2 Configuration**: Google and Microsoft authentication
- **JWT Configuration**: Secret key for JWT tokens
- **CORS Configuration**: Allowed origins for frontend
- **Trino Configuration**: Apache Trino connection settings
- **Application Configuration**: Spring Boot settings

### Frontend Environment

The frontend environment files are automatically generated based on the backend .env file:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## Security Notes

- The `.env` file contains sensitive information and is in `.gitignore`
- Never commit the `.env` file to version control
- Use different credentials for development, staging, and production
- Client IDs for OAuth are safe to include in frontend code
- Client secrets should never be included in frontend code

## Application URLs

Once running, the application will be available at:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

## Development Tips

1. **Use the Maven wrapper**: Always use `mvnw.cmd` instead of `mvn` to ensure consistent Maven version
2. **Check logs**: Backend logs appear in the console where you ran `start-backend.bat`
3. **Hot reload**: Frontend changes are automatically reloaded in the browser
4. **Database**: Ensure your PostgreSQL database is running and accessible

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Check the console output for error messages
4. Ensure all environment variables are set correctly

For additional help, refer to the main project documentation or create an issue in the repository. 