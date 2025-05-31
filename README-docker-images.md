# Docker Image Building for MoneyPlant

This document explains how to build Docker images for the MoneyPlant microservices.

## Automatic Docker Image Building

The project is configured to automatically build Docker images whenever a Maven package is created. This is done using the Maven Exec Plugin, which runs a script after the package phase.

### How It Works

1. When you run `mvn package` or any Maven command that includes the package phase (like `mvn clean install`), the Maven Exec Plugin will execute the appropriate script based on your operating system:
   - `build-docker-images.sh` for Unix/Linux/macOS
   - `build-docker-images.ps1` for Windows

2. The script will build Docker images for all microservices using the jib-maven-plugin, which is configured in each module's pom.xml.

3. The images will be tagged with the project version and "latest" and will be available in your local Docker registry.

## Manual Docker Image Building

If you want to build Docker images manually, you can run the scripts directly:

### Windows

```powershell
.\build-docker-images.ps1
```

### Unix/Linux/macOS

First, make the script executable:

```bash
chmod +x build-docker-images.sh
```

Then run it:

```bash
./build-docker-images.sh
```

## Docker Image Configuration

The Docker images are configured in the parent pom.xml using the jib-maven-plugin. The configuration includes:

- Base image: eclipse-temurin:21-jre
- Image name: rrekapalli/money-plant:${project.artifactId}
- Tags: ${project.version} and latest
- JVM flags: -Xms256m -Xmx512m
- Exposed port: 8080

Each module can override these settings in its own pom.xml.

## Running the Docker Containers

After building the Docker images, you can run the containers using Docker commands. For example:

```bash
docker run -p 8080:8080 rrekapalli/money-plant:api-gateway
```

Or you can create a docker-compose.yml file to run all the services together.

## Troubleshooting

If you encounter any issues with the Docker image building process, check the following:

1. Make sure Docker is installed and running on your system.
2. Make sure you have the necessary permissions to execute the scripts.
3. Check the jib-maven-plugin configuration in the pom.xml files.
4. Check the Maven Exec Plugin configuration in the parent pom.xml.