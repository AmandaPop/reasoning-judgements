import itertools
import sys
import csv

file = sys.argv[1]

def write_csv(filename, sents):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['sentence',
                                                   "verb", 
                                                   "context", 
                                                   'factP', 
                                                   'modal', 
                                                   'person', 
                                                   'conditional'])
        writer.writeheader()
        writer.writerows(sents)

nps = ['I', 'You', 'Sally'] 
verbs = ['believe', 'think']
modals = ['can', 'could', 'might', 'will', 'would', 'should', 'shall', 'ought to', '']
P = [('the sky is red', 0), ('the sky is blue', 1)]
q = 'went for a run'
conditional = [True, False]
contexts = ['QUD_weak', 'QUD_strong']


conditions = [i for i in itertools.product(nps, verbs, modals, P, conditional, contexts)]

data = []
for condition in conditions:
    #print(condition)
    np, verb, modal, p, conditional, context = condition
    if np == 'Sally':
        person = 3
    elif np == 'You':
        person = 2
    else:
        person = 1
    if person == 3 and modal == '':
        sentence = f'{np} {modal}{verb}s {p[0]}.'
    else:
        sentence = f'{np} {modal} {verb} {p[0]}.'
    if conditional:
        sentence = f"If {np} {verb} {p[0]}, then {np[0]} {q}."
    if context == 'QUD_weak':
        if person == 1:
            c = f'Do you {verb} {p[0]}?'
        elif person == 3:
            c = f'Does Sally {verb} {p[0]}?'
        else:
            c = f'Do I {verb} {p[0]}?'
    if context == 'QUD_strong':
        if person == 1:
            c = f'Do you know {p[0]}?'
        elif person == 3:
            c = f'Does she know {p[0]}?'
        else:
            c = f'Do I know {p[0]}?'
    factP = p[1]

    stimulus = {
        'sentence' : sentence,
        'verb' : verb,
        'context': c,
        'factP' : factP,
        'modal' : modal,
        'person' : person,
        'conditional' : conditional
    }
    data.append(stimulus)


write_csv(file, data)
