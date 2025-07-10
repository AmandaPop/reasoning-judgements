import itertools
import sys
import csv
import random

file = sys.argv[1]

def write_csv(filename, sents):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['sentence',
                                                   "verb", 
                                                   'SI',
                                                   "No_SI",
                                                   "context", 
                                                   'factP', 
                                                   'modal', 
                                                   'person', 
                                                   ])
        writer.writeheader()
        writer.writerows(sents)

person = ['1', '3'] 
nouns3 = [
    "Alice", "Benjamin", "Charlotte", "Daniel", "Emily",
    "Frank", "Grace", "Henry", "Isabella", "Jack",
    "Katherine", "Liam", "Mia", "Noah", "Olivia",
    "Peter", "Quinn", "Rachel", "Samuel", "Tara",
    "Victoria", "William", "Xander", 'Sally',
    "Zachary", "Andrew", "Bella", "Caleb", "Daisy",
    "Ethan", "Fiona", "George", "Hannah", "Ian",
    "Julia", "Kyle", "Laura", "Matthew", "Natalie",
    "Oscar", "Paige", "Ryan", "Sophie", "Thomas",
    "Violet", "Wesley"
    ]
verbs = ['believe', 'think']
modals = ['can', 'must', '']

P = [0, 1]
#considering to add: ('that about sums everything up', 2),
trueP = [('the sky is blue', 1),
      ("people need air to breathe", 1),
      ('the moon is in the sky', 1),
      ('a triangle has 3 sides', 1),
      ('grass is green', 1),
      ('people need to eat to survive', 1),
      ('people drink water when they are thirsty', 1),
      ('people write with pencils', 1),
      ('hats are worn on your head', 1),
      ('most airplanes fly faster than cars drive', 1),
      ('rain falls from the clouds in the sky', 1),
      ('the internet allows people to communicate across the world', 1),
      ('refrigerators are a good way to keep food cold', 1),
      ('electricity is what powers a lightbulb', 1),
      ('earth takes one year to orbit the sun', 1),
      ('gravity pulls objects towards the earth', 1),
      ('language is used to help people communicate', 1),
      ('water freezes at 0 degrees celcius', 1),
      ('birds migrate to warmer places during winter', 1),
      ('children learn to walk before they learn to run and jump', 1),
      ('the human heart is meant for pumping blood through the body', 1),
      ("oceans cover more than 70 percent of the earth's surface", 1),
      ('either it will rain tomorrow or it will not rain tomorrow', 1),
      ('a circle is round', 1)]
falseP = [
      ("the earth is flat", 0),
      ("the sun rises in the west", 0),
      ("water is dry", 0),
      ("birds have fur", 0),
      ("fish can live on land without water", 0),
      ("snow is hot", 0),
      ("fire is cold", 0),
      ("the moon is made of cheese", 0),
      ("trees can walk", 0),
      ("people can see through walls", 0),
      ("rain falls upward", 0),
      ("cats can speak English", 0),
      ("a triangle has four sides", 0),
      ("elephants are the size of ants", 0),
      ("books grow on trees", 0),
      ("the ocean is made of lemonade", 0),
      ("time moves backward at night", 0),
      ("spiders have six legs", 0),
      ("humans have three eyes", 0),
      ("clouds are made of cotton", 0),
      ("humans can photosynthesize like plants", 0),
      ("the brain is located in the stomach", 0),
      ('The capital of France is Madrid.', 0),
      ('Mount Everest is located in the United States.', 0)
    ]
q = 'went for a run'
#conditional = [True, False]
contexts = ['QUD_weak', 'QUD_strong']


conditions = [i for i in itertools.product(person, verbs, modals, P, contexts)]

data = []
for condition in conditions:
    person, verb, modal, p, context = condition
    if p == 0:
        choice = random.choice(falseP)
        falseP.remove(choice)
        clause = choice[0]
    elif p == 1:
        choice = random.choice(trueP)
        trueP.remove(choice)
        clause = choice[0]
    if person == '3':
        #pick a random noun to use, then remove it so we don't use it again
        np = random.choice(nouns3)
        nouns3.remove(np)
    else:
        np = 'I'
        #sally thinks/beleives P
    if person == '3' and modal == '':
        sentence = f'{np} {verb}s {clause}.'
        si = f"{np} {verb}s but doesn't know {clause}."
        no_si = f"{np} {verb}s and possibly knows {clause}."
    #I think/believe P
    elif person != '3' and modal == '':
        sentence = f'{np} {verb} {clause}.'
        si = f"{np} {verb} but don't know {clause}."
        no_si = f"{np} {verb} and possibly know {clause}."
    elif person == '3':
    #Sally can think/believe P
        sentence = f'{np} {modal} {verb} {clause}.'
        si = f"{np} {modal} {verb} but doesn't know {clause}."
        no_si = f"{np} {modal} {verb} and possibly know {clause}."
    #I/You can think/believe P
    else:
        sentence = f'{np} {modal} {verb} {clause}.'
        si = f"{np} {modal} {verb} but don't know {clause}."
        no_si = f"{np} {modal} {verb} and possibly know {clause}."
    # if conditional:
    #     sentence = f"If {np} {verb} {p[0]}, then {np[0]} {q}."
    if context == 'QUD_weak':
        if person == '1':
            c = f'Do you {verb} {clause}?'
        elif person == '3':
            c = f'Does {np} {verb} {clause}?'
    if context == 'QUD_strong':
        if person == '1':
            c = f'Do you know {clause}?'
        elif person == '3':
            c = f'Does she know {clause}?'


    stimulus = {
        'sentence' : sentence,
        'SI' : si,
        'No_SI' : no_si,
        'verb' : verb,
        'context': c,
        'factP' : p,
        'modal' : modal,
        'person' : person,
        #'conditional' : conditional
    }
    data.append(stimulus)


write_csv(file, data)
