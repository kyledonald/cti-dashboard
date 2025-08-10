#!/bin/bash

echo "Running tests and updating results"

npm run test:results

cp test-results.json ../web-app/public/

echo "Results available at: /test-results.json"
echo "Refresh testing page to see the latest results" 
