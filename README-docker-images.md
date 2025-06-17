# Docker Image Building for MoneyPlant

This document explains how to build a Docker image for the MoneyPlant monolithic application.

## Automatic Docker Image Building

The project is configured to automatically build a Docker image whenever a Maven package is created. This is done using the Maven Exec Plugin, which runs a script after the package phase.

### How It Works

1. When you run `mvn package` or any Maven command that includes the package phase (like `mvn clean install`), the Maven Exec Plugin will execute the appropriate script based on your operating system:
   - `build-docker-images.sh` for Unix/Linux/macOS
   - `build-docker-images.ps1` for Windows

2. The script will build a Docker image for the monolithic application (moneyplant-app) using the jib-maven-plugin, which is configured in the module's pom.xml.

3. The image will be tagged with the project version and "latest" and will be available in your local Docker registry.

## Manual Docker Image Building

If you want to build the Docker image manually, you can run the scripts directly:

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

The Docker image is configured in the parent pom.xml using the jib-maven-plugin. The configuration includes:

- Base image: eclipse-temurin:21-jre
- Image name: rrekapalli/money-plant:${project.artifactId}
- Tags: ${project.version} and latest
- JVM flags: -Xms256m -Xmx512m
- Exposed port: 8080

The moneyplant-app module has the jib-maven-plugin enabled with skip=false.

## Running the Docker Container

After building the Docker image, you can run the container using Docker commands. For example:

```bash
docker run -p 8080:8080 rrekapalli/money-plant:moneyplant-app
```

## Troubleshooting

If you encounter any issues with the Docker image building process, check the following:

1. Make sure Docker is installed and running on your system.
2. Make sure you have the necessary permissions to execute the scripts.
3. Check the jib-maven-plugin configuration in the pom.xml files.
4. Check the Maven Exec Plugin configuration in the parent pom.xml.
