import os
import sys
import csv
import re 
import stanza

#get corpus from patas: /corpora/LDC/LDC95T07/RAW/raw/wsj , then run -> grep -L -r 'believe' . | xargs rm 

def get_corpus(root):
    corpus = []

    for dirpath, dirnames, filenames in os.walk(root):
        for file in filenames:
            full_path = os.path.join(dirpath, file)
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                corpus.append(content.replace(".START", ''))

    return corpus

def get_sentences(corpus, target):
    nlp = stanza.Pipeline(lang='en', processors='tokenize,mwt,pos,lemma,depparse')
    examples = []
    for i, entry in enumerate(corpus):
        # if i > 5: 
        #     break
        entry = re.sub(r"\w{1}.\d+", '', entry) #removing speaker ids so sentence is parsed correctly
        #entry = re.sub(r"\n", ' ', entry) #replace ranomd new lines with space
        
        doc = nlp(entry)
        for j, sent in enumerate(doc.sentences):
            
            for word in sent.words:

                if word.lemma.lower() == target.lower() and word.head == 0: #if target word is the head of the sentence, using lemma because it allowes for believe, believes, believed
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

def write_csv(filename, sentences):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=["target", "context"])
        writer.writeheader()
        writer.writerows(sentences)

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
    path_to_corpus_folder = sys.argv[1]
    corpus = get_corpus(path_to_corpus_folder)
    sentences = get_sentences(corpus, 'think')
    final_sentences = remove_believe_in(sentences)
    write_csv('think_wsj.csv', final_sentences)