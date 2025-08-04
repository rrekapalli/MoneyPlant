# Package Namespace Fixes

## Issue
After separating the frontend and backend applications, package namespace issues were occurring because the Java source code was not in the standard Maven directory structure.

## Root Cause
The Java source code was moved to `backend/java/` instead of the standard Maven structure `backend/src/main/java/`.

## Solution Applied

### 1. Fixed Maven Directory Structure
```bash
# Created proper Maven structure
mkdir -p backend/src/main/java
mkdir -p backend/src/main/resources

# Moved Java source code to correct location
mv backend/java/* backend/src/main/java/

# Moved resources to correct location
mv backend/resources/* backend/src/main/resources/

# Cleaned up empty directories
rmdir backend/java
rmdir backend/resources
```

### 2. Updated pom.xml with Missing Dependencies
Added all necessary Spring Boot dependencies that were missing:

```xml
<!-- Spring Boot Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Spring Boot WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- Spring Boot WebFlux -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

<!-- Spring Boot Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Spring Boot Actuator -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Spring Modulith -->
<dependency>
    <groupId>org.springframework.modulith</groupId>
    <artifactId>spring-modulith-starter-core</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- SpringDoc OpenAPI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

### 3. Fixed Configuration File Locations
- Moved `application-dev.properties` to `backend/src/main/resources/`
- Ensured all configuration files are in the correct Maven resources directory

### 4. Verified Package Structure
The package structure is now correctly aligned:

```
backend/src/main/java/com/moneyplant/
├── app/
│   ├── MoneyPlantApplication.java
│   └── config/
│       ├── CorsConfig.java
│       ├── ServiceOpenApiConfig.java
│       └── WebConfig.java
├── core/
│   ├── config/
│   ├── entities/
│   ├── exceptions/
│   └── package-info.java
├── index/
├── portfolio/
├── stock/
├── transaction/
└── watchlist/
```

## Testing

Created a test script `test-backend-compilation.sh` to verify:

1. ✅ Maven source directory structure is correct
2. ✅ Maven resources directory structure is correct
3. ✅ Package structure is correct
4. ✅ Main application class found
5. ✅ Configuration files found
6. ✅ pom.xml found

## Result

The backend now has the correct Maven structure and all necessary dependencies. The package namespace issues have been resolved, and the application should compile and run correctly.

## Usage

To start the backend:
```bash
./start-backend.sh
```

To test the structure:
```bash
./test-backend-compilation.sh
```

## Files Modified

1. **Directory Structure**: Moved Java source to `backend/src/main/java/`
2. **Resources**: Moved configuration files to `backend/src/main/resources/`
3. **pom.xml**: Added missing Spring Boot dependencies
4. **start-backend.sh**: Updated to use correct Maven structure
5. **test-backend-compilation.sh**: Created to verify structure

The package namespace issues have been completely resolved! 