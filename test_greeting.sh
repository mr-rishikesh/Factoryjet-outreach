#!/bin/bash
contactId="69f4903c66fb06e52a216720"
curl -X POST "http://localhost:5000/email/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"contactIds\": [\"$contactId\"],
    \"emailDraft\": {
      \"subject\": \"Test Greeting - Should Not Duplicate\",
      \"body\": \"I came across your company and wanted to reach out about something.\"
    }
  }" 2>&1
