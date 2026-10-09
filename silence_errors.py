import os
import re

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            # Replace console.error with console.warn in common patterns
            content = re.sub(r'console\.error\((.*?)\)', r'console.warn(\1)', content)
            
            with open(path, 'w') as f:
                f.write(content)
