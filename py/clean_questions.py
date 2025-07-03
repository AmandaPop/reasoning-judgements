import sys
import csv

file = sys.argv[1]
out_file = sys.argv[2]

def write_csv(filename, sentences):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=["target", "context"])
        writer.writeheader()
        writer.writerows(sentences)

no_question_list = []
with open(file, 'r') as f:
    data = csv.reader(f)
    next(data, None) #skip header
    for line in data:
        if not '?' in line[0]:
            example = {'target': line[0], 'context': line[1]}
            no_question_list.append(example)

write_csv(out_file, no_question_list)

            