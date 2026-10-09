import re

with open('src/components/MenstrualTracker.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'alert("Failed to save. Check your connection.");',
    'console.error("Failed to save.");'
)

with open('src/components/MenstrualTracker.tsx', 'w') as f:
    f.write(content)
