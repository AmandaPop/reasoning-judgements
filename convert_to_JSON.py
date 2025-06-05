import csv
import json
import ast

input_filename = './data_csv/test_stimulus_ready.csv'        # your input file
output_filename = 'test_think_clean.csv' # cleaned output file

def clean_context(context_str):
    try:
        # Convert string representation of list to actual Python list
        python_list = ast.literal_eval(context_str)

        # Ensure it's a list
        if not isinstance(python_list, list):
            raise ValueError("Context is not a list.")

        # Convert to properly escaped JSON string (with double quotes)
        return json.dumps(python_list)
    except Exception as e:
        print(f"Warning: Skipping bad context: {context_str}\nError: {e}")
        return ''  # Or return context_str to keep it unchanged

with open(input_filename, 'r', newline='', encoding='utf-8') as infile, \
     open(output_filename, 'w', newline='', encoding='utf-8') as outfile:

    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)

    writer.writeheader()

    for row in reader:
        # Clean the context column
        row['context'] = clean_context(row['context'])
        writer.writerow(row)

