import os
import sys
import csv
import re 
import time
import stanza

#get corpus from: /corpora/LDC/LDC93T4/trans then go to that folder and run -> grep -L -r 'believe' . | xargs rm  , then run ->find . -type f ! -name "*.txt" -delete to remove file that aren't .txt
start_time = time.time()

def get_corpus(root):
    corpus = []

    for dirpath, dirnames, filenames in os.walk(root):
        for file in filenames:
            if file.endswith('.txt'):
                full_path = os.path.join(dirpath, file)
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.readlines()
                    content_needed = content[17:]
                    new = ' '.join(content_needed)
                    corpus.append(new)
    return corpus

def get_sentences(corpus, target):
    nlp = stanza.Pipeline(lang='en', processors='tokenize,mwt,pos,lemma,depparse')
    examples = []
    for i, entry in enumerate(corpus):
        entry = re.sub(r"\w{1}.\d+", '', entry) #removing speaker ids so sentence is parsed correctly
        
        doc = nlp(entry)
        for j, sent in enumerate(doc.sentences):
            
            for word in sent.words:

                if word.lemma.lower() == target.lower() and word.head == 0: #if target word is the head of the sentence
                    exclude = False
                    for child in sent.words:
                        if child.head == word.id and child.lemma.lower() == 'not': #checking if a word is a child of this word.id which is the root
                            exclude = True
                            break
                    if not exclude: #if not is not a child of believe add it to list of examples
                        context = [s.text.replace('\n', "") for s in doc.sentences[max(0, j-5):j]] #get up to 5 context sentences
                        example = {'target': sent.text.replace('\n', ""), 'context': context}
                        examples.append(example)
                    break #next sentence

    return examples

def write_csv(filename, examples):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=["target", "context"])
        writer.writeheader()
        writer.writerows(examples)

def remove_believe_in(sentences):
    examples = []
    for entry in sentences:
        for target in entry.values():
            if 'believe in' not in target:
                examples.append(entry)
                break 
            break #go to next sentence
  
    return examples

if __name__ == "__main__":
    path_to_folder = sys.argv[1]
    corpus = get_corpus(path_to_folder)
    sentences = get_sentences(corpus, 'think')
    #final_sentences = remove_believe_in(sentences)
    write_csv('think_swbd.csv', sentences)
    end_time = time.time()
    print("Total seconds running:", end_time - start_time)
