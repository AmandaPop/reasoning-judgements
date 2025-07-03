import time
import csv
import stanza
from datasets import load_dataset

""" Note: Only searchs a random 100,000 wiki pedia articles. As well,
only searhes through short articles - Longer takes to long for stanza 
to process. Need to change whether the file is searching for think or 
believe before running. """

ds = load_dataset("wikimedia/wikipedia", "20231101.en")

start_time = time.time()

def get_corpus(ds, max_sentences=10):
    full_corpus = ds['train'].select(range(10000))
    believe_corpus = []

    for entry in full_corpus:
        text = entry['text']
        if 'believe' in text:
            sentences = text.split('\n')
            if len(sentences) > 20:
                pass
            else:
                believe_corpus.append(text)

    
    print(f"Filtered to {len(believe_corpus)} entries containing 'think'")
    return believe_corpus

def get_sentences(corpus, target):
    nlp = stanza.Pipeline(lang='en', processors='tokenize,mwt,pos,lemma,depparse')
    examples = []

    for i, entry in enumerate(corpus):
  
        doc = nlp(entry)
        for j, sent in enumerate(doc.sentences):
            
            for word in sent.words:

                if word.lemma.lower() == target.lower() and word.head == 0: #if target word is the head of the sentence
                    
                    exclude = False
                    for child in sent.words:
                        if child.head == word.id and child.lemma.lower() == 'not': #checking if a word is a child of this word.id which is the root
                            
                            exclude = True
                            break
                    if not exclude: #if 'not' is not a child of believe add it to list of examples
                        
                        context = [s.text.replace('\n', "") for s in doc.sentences[max(0, j-5):j]] #get up to 5 context sentences
                        example = {'target': sent.text.replace('\n', ""), 'context': context}
                        examples.append(example)
   
                        break #next sentence

    return examples

def remove_believe_in(sentences):
    examples = []
    for entry in sentences:
        for target in entry.values():
            if 'believe in' not in target:
                examples.append(entry)
                break 
            break #go to next sentence
  
    return examples

def write_csv(filename, sentences):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=["target", "context"])
        writer.writeheader()
        writer.writerows(sentences)


corpus = get_corpus(ds)
sentences = get_sentences(corpus, 'believe')
final_sentences = remove_believe_in(sentences)
write_csv('filler.csv', final_sentences)
end_time = time.time()
print("Total Time to get through all entries:", end_time - start_time)