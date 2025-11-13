#!/bin/bash

# Simple test script for NSE Provider without full Maven build
# This tests the core logic: session initialization and API calls

echo "=== NSE India Provider Test ==="
echo ""

# Download httpclient5 JAR if not present
if [ ! -f "httpclient5-5.3.jar" ]; then
    echo "Downloading Apache HttpClient 5..."
    mvn dependency:copy -Dartifact=org.apache.httpcomponents.client5:httpclient5:5.3 -DoutputDirectory=. -q
    mv httpclient5-5.3.jar httpclient5.jar 2>/dev/null || true
fi

# Compile and run the manual test
cd engines
mvn exec:java -Dexec.mainClass="com.moneyplant.engines.ingestion.provider.NseIndiaProviderManualTest" \
    -Dexec.classpathScope=test \
    -q

echo ""
echo "Test complete!"
