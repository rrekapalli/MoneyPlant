#!/bin/bash
echo "Testing January 2024 dates..."
for day in 02 08 09 10 11 12; do
    URL="https://archives.nseindia.com/content/historical/EQUITIES/2024/JAN/cm${day}JAN2024bhav.csv.zip"
    HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null "$URL")
    echo "Jan $day, 2024: HTTP $HTTP_CODE"
    sleep 0.3
done
