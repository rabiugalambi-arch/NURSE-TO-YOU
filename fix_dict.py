with open('src/contexts/LanguageContext.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
cancel_count = 0
for line in lines:
    if "'Cancel': 'Soke'" in line:
        cancel_count += 1
        if cancel_count > 1:
            continue
    new_lines.append(line)

with open('src/contexts/LanguageContext.tsx', 'w') as f:
    f.writelines(new_lines)
