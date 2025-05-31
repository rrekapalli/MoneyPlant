# Running MoneyPlant APIs

This document provides instructions for running all MoneyPlant microservices using the provided scripts for Windows and Linux.

## Prerequisites

### Windows Prerequisites

Before running the APIs on Windows, ensure you have the following installed:

- Java 21 or higher
- Maven 3.8 or higher
- PowerShell 5.0 or higher

### Linux Prerequisites

Before running the APIs on Linux, ensure you have the following installed:

- Java 21 or higher
- Maven 3.8 or higher
- A terminal emulator (gnome-terminal, xterm, or konsole)

## Running All APIs

Both the Windows PowerShell script (`run-all-apis.ps1`) and the Linux Bash script (`run-all-apis.sh`) will start all MoneyPlant microservices in the correct order:

1. Config Server
2. Discovery Server
3. Microservices (Portfolio, Stock, Transaction, Watchlist)
4. API Gateway

### Steps to Run on Windows

1. Open PowerShell as Administrator
2. Navigate to the MoneyPlant project root directory
3. Run the script:

```powershell
.\run-all-apis.ps1
```

The script will:
- Start each service in a separate PowerShell window
- Set the appropriate environment variables
- Wait for dependencies to start before launching dependent services

### Steps to Run on Linux

1. Open a terminal
2. Navigate to the MoneyPlant project root directory
3. Make the script executable (if not already):

```bash
chmod +x run-all-apis.sh
```

4. Run the script:

```bash
./run-all-apis.sh
```

The script will:
- Start each service in a separate terminal window
- Set the appropriate environment variables
- Wait for dependencies to start before launching dependent services

## Accessing the Services

Once all services are running, you can access:

- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761

## Stopping the Services

### Stopping Services on Windows

To stop all services on Windows:

1. Close all PowerShell windows that were opened by the script
2. Or press Ctrl+C in each window to stop the respective service

### Stopping Services on Linux

To stop all services on Linux:

1. Close all terminal windows that were opened by the script
2. Or press Ctrl+C in each terminal to stop the respective service

## Troubleshooting

If you encounter issues:

1. Ensure all prerequisites are installed
2. Check that no other applications are using the required ports
3. Verify that the environment variables are set correctly
4. Check the service logs in each terminal window for specific error messages

### Linux-Specific Troubleshooting

If you encounter issues on Linux:

1. Ensure the script has executable permissions (`chmod +x run-all-apis.sh`)
2. If terminal windows don't open, make sure you have one of the supported terminal emulators installed (gnome-terminal, xterm, or konsole)
3. If you see "command not found" errors, ensure that Java and Maven are in your PATH

For more detailed deployment information, refer to the `deployment.md` file in the docs directory.
