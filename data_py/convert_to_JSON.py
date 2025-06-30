import csv
import json
import ast

input_filename = '../data_csv/believe_feats.csv'        # your input file
output_filename = 'believe.csv' # cleaned output file

def clean_context(context_str):
    try:
        # Try to evaluate the string as a Python literal (like a list)
        python_list = ast.literal_eval(context_str)

        # Ensure it's a list
        if not isinstance(python_list, list):
            raise ValueError("Context is not a list.")

        # Convert to JSON-compliant string (double quotes etc.)
        return json.dumps(python_list)
    except Exception as e:
        print(f"Warning: Skipping bad context:\n{context_str}\nError: {e}\n")
        return None  # Signal that this row should be skipped

with open(input_filename, 'r', newline='', encoding='utf-8') as infile, \
     open(output_filename, 'w', newline='', encoding='utf-8') as outfile:

    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        cleaned_context = clean_context(row['context'])
        if cleaned_context is not None:
            row['context'] = cleaned_context
            writer.writerow(row)