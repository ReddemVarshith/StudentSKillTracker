import re

with open('gfg_dump.html', 'r', encoding='utf-8') as f:
    html = f.read()

score = 0
problems_solved = 0

# The JSON might be escaped like \"score\":151
score_match = re.search(r'\\*"score\\*"\s*:\s*(\d+)', html)
if score_match:
    score = int(score_match.group(1))

problems_match = re.search(r'\\*"total_problems_solved\\*"\s*:\s*(\d+)', html)
if problems_match:
    problems_solved = int(problems_match.group(1))

print(f"Parsed -> Score: {score}, Solved: {problems_solved}")
