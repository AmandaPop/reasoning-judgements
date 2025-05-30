import sys
import csv
import stanza 

nlp = stanza.Pipeline(lang='en', processors='tokenize,mwt,pos,lemma,depparse')

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
    for line in data: #only dealing with 3 rn so it finishes
        line = str(line[0])
        doc = nlp(line)
        #there will only ever be one sentence in the doc
        for sentence in doc.sentences:
            #for each sentence use tokenization: 
            # find the verb and then add "and possibly know" and "but don't know"
            #check for various congugations before inserting the word 
            print(sentence.text)
            
        
        


