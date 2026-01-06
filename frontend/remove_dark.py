import os
import re

def remove_dark_classes(directory):
    pattern = re.compile(r'\sdark:[^ "\'}]+')
    pattern_start = re.compile(r'^dark:[^ "\'}]+')
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.jsx', '.ts', '.js', '.css')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace " dark:class" with ""
                new_content = pattern.sub('', content)
                # Replace "dark:class" at start of string or after a quote
                new_content = re.sub(r'([ "\'])dark:[^ "\'}]+', r'\1', new_content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Cleaned: {path}")

if __name__ == "__main__":
    remove_dark_classes('src')
