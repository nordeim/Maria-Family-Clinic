import re

with open('/workspace/my-family-clinic/src/server/api/routers/clinic.ts', 'r') as f:
    lines = f.readlines()

brace_count = 0
paren_count = 0
problem_lines = []

for i, line in enumerate(lines, 1):
    # Remove strings and comments to avoid counting braces in them
    clean_line = re.sub(r'["\'].*?["\']', '', line)
    clean_line = re.sub(r'//.*$', '', clean_line)
    
    for char in clean_line:
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
        elif char == '(':
            paren_count += 1
        elif char == ')':
            paren_count -= 1
    
    # Report if balance goes negative (more closing than opening)
    if brace_count < 0 or paren_count < 0:
        problem_lines.append((i, brace_count, paren_count, line.strip()))

print("Lines where balance goes negative:")
for line_num, b_count, p_count, line_text in problem_lines[:10]:
    print(f"Line {line_num}: braces={b_count}, parens={p_count}")
    print(f"  {line_text[:80]}")
    
print(f"\nFinal counts: braces={brace_count}, parens={paren_count}")
