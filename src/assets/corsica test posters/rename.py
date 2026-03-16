import os
import re

files = [f for f in os.listdir('.') if os.path.isfile(f) and not f.startswith('.') and not f.endswith('.json') and f != 'rename.py']

renamed_count = 0

for filename in files:
    name, ext = os.path.splitext(filename)
    new_name = name
    
    # Pattern for 2-digit years after separator: D.M.YY or DD.M.YY or D.MM.YY or DD.MM.YY
    new_name = re.sub(r'(\s|–|-)(\d{1,2})\.(\d{1,2})\.(\d{2})(?!\d)', 
                      lambda m: f"{m.group(1)}{m.group(2).zfill(2)}.{m.group(3).zfill(2)}.20{m.group(4)}", 
                      new_name)
    
    # Pattern for 4-digit years that need padding after separator
    new_name = re.sub(r'(\s|–|-)(\d{1,2})\.(\d{1,2})\.(\d{4})', 
                      lambda m: f"{m.group(1)}{m.group(2).zfill(2)}.{m.group(3).zfill(2)}.{m.group(4)}", 
                      new_name)
    
    # Handle dates at the start of filename
    new_name = re.sub(r'^(\d{1,2})\.(\d{1,2})\.(\d{2})(?!\d)', 
                      lambda m: f"{m.group(1).zfill(2)}.{m.group(2).zfill(2)}.20{m.group(3)}", 
                      new_name)
    
    new_name = re.sub(r'^(\d{1,2})\.(\d{1,2})\.(\d{4})', 
                      lambda m: f"{m.group(1).zfill(2)}.{m.group(2).zfill(2)}.{m.group(3)}", 
                      new_name)
    
    new_filename = new_name + ext
    
    if new_filename != filename:
        try:
            os.rename(filename, new_filename)
            print(f"{filename} -> {new_filename}")
            renamed_count += 1
        except Exception as e:
            print(f"Error renaming {filename}: {e}")

print(f"\nRenamed {renamed_count} files")
