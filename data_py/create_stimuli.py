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
        writer = csv.DictWriter(file, fieldnames=["target", "context"])
        writer.writeheader()
        writer.writerows(sentences)


no_question_list = []
with open(file, 'r') as f:
    data = csv.reader(f)
    next(data, None) #skip header
    data = list(itertools.islice(data, 0, 2)) #just want to only do 2 sentences for now
    for line in data:
        line = str(line[0])
        doc = nlp(line)
        for sentence in doc.sentences:
            new_sentence = []
            #find which replacement you want by checking morphological features on the verb
            for word in sentence.words:
                #first find the verb
                if word.lemma == verb:
                    print(word.feats)
                    #get the index of this verb, needed for replacement
                    verb_id = word.id
                    #check features of the verb and insert new statement accordingly
                    if 'Tense=Past|VerbForm=Fin' in word.feats:
                        new_sentence.append(f'{word.text} but not knew')
                    elif 'Tense=Past|VerbForm=Part' in word.feats:
                        new_sentence.append(f"{word.text} but not known")
                    elif 'Person=1|Tense=Pres|VerbForm=Fin' in word.feats:
                        new_sentence.append(f"{word.text} but don't know")
                    elif 'Person=3|Tense=Pres|VerbForm=Fin' in word.feats:
                        new_sentence.append(f"{word.text} but doesn't know")
                    elif 'VerbForm=Inf' in word.feats:
                        new_sentence.append(f"{word.text} but don't know")
                    elif 'Tense=Pres|VerbForm=Part' in word.feats:
                        new_sentence.append(f"{word.text} but not knowing")
                    else:
                        print("This sentence is odd:", sentence.text)
                #if its not the verb just re-add it 
                else:
                    new_sentence.append(word.text)
            print(new_sentence)



                    
            
        
        


