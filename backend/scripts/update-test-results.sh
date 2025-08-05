#!/bin/bash

echo "🧪 Running tests and updating results..."

# Run tests and generate results
npm run test:results

# Copy results to webapp public folder
cp test-results.json ../web-app/public/

echo "✅ Test results updated and copied to webapp!"
echo "📁 Results available at: /test-results.json"
echo "🌐 Refresh your testing page to see the latest results" 