import re
import sys

def extract_code_blocks(md_file):
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all code blocks
    pattern = r'```(?:typescript|tsx|javascript|jsx)?\s*\n([\s\S]*?)```'
    matches = re.findall(pattern, content)
    
    print(f"Found {len(matches)} code blocks")
    
    for i, code in enumerate(matches, 1):
        print(f"\nBlock {i}:")
        print(code[:100])  # Print first 100 chars

if __name__ == '__main__':
    if len(sys.argv) > 1:
        extract_code_blocks(sys.argv[1])
    else:
        print("Usage: python extract_from_md.py <markdown_file>")
