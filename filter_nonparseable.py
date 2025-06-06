import csv
import json

input_file = 'think_clean.csv'
output_file = 'think_clean_filtered.csv'

valid_rows = []

with open(input_file, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        context_str = row.get('context', '')

        try:
            # Replace single quotes with double quotes for JSON parsing (like your JS)
            parsed_context = json.loads(context_str.replace("'", '"'))
            row['context'] = parsed_context  # optional: keep parsed context in memory
            valid_rows.append(row)
        except json.JSONDecodeError:
            print(f"Skipping invalid context: {context_str}")

# Write valid rows to a new CSV
if valid_rows:
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=valid_rows[0].keys())
        writer.writeheader()
        writer.writerows(valid_rows)

print(f"Filtered CSV written to: {output_file}")