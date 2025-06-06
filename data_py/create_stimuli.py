import sys
import csv
import itertools
import stanza 


nlp = stanza.Pipeline(lang='en', processors='tokenize,mwt,pos,lemma,depparse')

file = sys.argv[1]
verb = str(sys.argv[2])
out_file = sys.argv[3]

def write_csv(filename, sentences):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['original', "target", "context", 'tense', 'form', 'person', ])
        writer.writeheader()
        writer.writerows(sentences)

stimuli = []
with open(file, 'r') as f:
    data = csv.reader(f)
    next(data, None) #skip header
    
    for line in data:
        context = line[1]
        line = str(line[0])
        
        doc = nlp(line)
        for sentence in doc.sentences:
            new_sentence = []
            updated_original = []
            person = None
            tense = None
            form = None
            skip_sentence = False  #flag to skip the whole sentence

            for word in sentence.words:
                if word.lemma == verb:
                    if 'Tense=Past|VerbForm=Fin' in word.feats:
                        tense = 'past'
                        form = 'fin'
                        new_sentence.append(f'{word.text} but not knew')
                        updated_original.append(f'{word.text} and possibly knew')
                    elif 'Tense=Past|VerbForm=Part' in word.feats:
                        tense = 'past'
                        form = 'fin'
                        new_sentence.append(f"{word.text} but not known")
                        updated_original.append(f'{word.text} and possibly known')
                    elif 'Person=1|Tense=Pres|VerbForm=Fin' in word.feats:
                        tense = 'pres'
                        form = 'fin'
                        person = '1'
                        new_sentence.append(f"{word.text} but don't know")
                        updated_original.append(f'{word.text} and possibly know')
                    elif 'Person=3|Tense=Pres|VerbForm=Fin' in word.feats:
                        tense = 'pres'
                        form = 'fin'
                        person = '3'
                        new_sentence.append(f"{word.text} but doesn't know")
                        updated_original.append(f'{word.text} and possibly knows')
                    elif 'VerbForm=Inf' in word.feats:
                        form = 'inf'
                        new_sentence.append(f"{word.text} but don't know")
                        updated_original.append(f'{word.text} and possibly know')
                    elif 'Tense=Pres|VerbForm=Part' in word.feats:
                        tense = 'pres'
                        form = 'part'
                        new_sentence.append(f"{word.text} but not knowing")
                        updated_original.append(f'{word.text} and possibly knowing')
                    else:
                        print("This sentence is odd:", sentence.text)
                        skip_sentence = True
                        break  #break out of word loop
                else:
                    new_sentence.append(word.text)
                    updated_original.append(word.text)

            if skip_sentence:
                continue  #skip the rest of this sentence block

            target_sentence = ' '.join(new_sentence)
            original_sentence = ' '.join(updated_original)

            stimulus = {
                'original': original_sentence, 
                'target': target_sentence, 
                'context': context,
                'tense': tense if tense else 'none',
                'form': form if form else 'none',
                'person': person if person else 'none'
            }
            stimuli.append(stimulus)

write_csv(out_file, stimuli)
