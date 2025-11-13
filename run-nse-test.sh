#!/bin/bash

echo "Setting up NSE Provider test..."
echo ""

# Create lib directory if it doesn't exist
mkdir -p lib

# Download dependencies if not present
if [ ! -f "lib/httpclient5-5.3.jar" ]; then
    echo "Downloading Apache HttpClient 5 and Brotli dependencies..."
    cd engines
    mvn dependency:copy-dependencies -DoutputDirectory=../lib -DincludeArtifactIds=httpclient5,httpcore5,httpcore5-h2,slf4j-api,dec -q
    cd ..
fi

# Compile the test
echo "Compiling test..."
/home/raja/.jdks/corretto-21.0.8/bin/javac -cp "lib/*" TestNseProvider.java

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Compilation successful"
echo ""
echo "Running NSE Provider test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the test
/home/raja/.jdks/corretto-21.0.8/bin/java -cp ".:lib/*" TestNseProvider

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
