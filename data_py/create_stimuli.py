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
    #data = list(itertools.islice(data, 0, 2)) #just want to only do 2 sentences for now
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
            #find which replacement you want by checking morphological features on the verb
            for word in sentence.words:
                #first find the verb
                if word.lemma == verb:
                   
                    #get the index of this verb, needed for replacement
                    verb_id = word.id
                    #check features of the verb and insert new statement accordingly
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
                #if its not the verb just re-add it 
                else:
                    new_sentence.append(word.text)
                    updated_original.append(word.text)
        
            target_sentence = ' '.join(new_sentence)
            
            original_sentence = ' '.join(updated_original)
            stimulus = {'original': original_sentence, 
                        'target': target_sentence, 
                        'context': context,
                        'tense': tense if tense else 'none',
                        'form': form if form else 'none',
                        'person': person if person else 'none'}
            
            stimuli.append(stimulus)
for i, row in enumerate(stimuli):
    print(f"Row {i}: {row!r}")
write_csv(out_file, stimuli)



                    
            
        
        


