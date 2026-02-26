import json
import re

with open('gfg_dump.html', 'r', encoding='utf-8') as f:
    html = f.read()
    
# Find all json-like structures
matches = re.findall(r'(\{"[^"]+":.*?151.*?\})', html)
for i, m in enumerate(matches):
    print(f"Match {i}: {m[:200]}...")
    
print("-" * 50)
    
matches = re.findall(r'(\{"[^"]+":.*?73.*?\})', html)
for i, m in enumerate(matches):
    print(f"Match {i}: {m[:200]}...")
