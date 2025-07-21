import itertools
import sys
import csv
import random

#add weak and strong QUD to each one and remove context as a condition

#make conditions across P, modals, and person = 8 condition settings = 32 (4 sentences each) sentences = 16 sentences of true and false 

def write_csv(filename, sents):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['believe_sentence',
                                                  'think_sentence',
                                                  'QUD_weak_believe',
                                                  'QUD_weak_think',
                                                  'QUD_strong',
                                                   'factP', 
                                                   'modal', 
                                                   'person', 
                                                   'np',
                                                   'p',
                                                   'item'
                                                   ])
        writer.writeheader()
        writer.writerows(sents)

person = ['1', '3'] 
nouns3 = [
    "Emily", "James", "Olivia", "Michael",
    "Sophia", "Daniel", "Ava", "Benjamin",
    "Isabella", "William", "Mia", "Alexander",
    "Charlotte", "Ethan", "Amelia", "Noah",
    "Liam", "Harper", "Lucas", "Ella",
    "Henry", "Grace", "Jack", "Chloe",
    "Max", "Lily", "Matthew", "Zoe",
    "Jacob", "Sally", "Logan", "Sarah"
]
#verbs = ['believe', 'think'] 
modals = ['modal', '']
P = [0, 1]

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
      ('there are 100 centimeters in a meter', 1),
      ('a circle is round', 1)
      ]
falseP = [
      ("the earth is flat", 0),
      ("the sun rises in the west", 0),
      ("water is dry", 0),
      ("whales have feathers", 0),
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
      ('the capital of France is Madrid.', 0),
      ('Mount Everest is located in the United States.', 0)
    ]

contexts = ['QUD_weak', 'QUD_strong']


conditions = [i for i in itertools.product(person, modals, P)]

data = []
for condition in conditions:
    person, modals, p = condition
    for i in range(0,4):
        #print(f'person: {person}, modals: {modals}, modal: {modals}, factP: {p}, item: {i}, clause: {p}')
        item = i
        if modals == 'modal':
            modal = random.choice(['can', 'might'])
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
        if person == '3' and modals == '':
            believe_sentence = f'{np} believes {clause}.'
            think_sentence = f'{np} thinks {clause}.'
            QUD_weak_believe = f'Does {np} believe {clause}?'
            QUD_weak_think = f'Does {np} think {clause}?'
            QUD_strong = f'Does {np} know {clause}?'
  
        #I think/believe P
        elif person != '3' and modals == '':
            believe_sentence = f'{np} believe {clause}.'
            think_sentence = f'{np} think {clause}.'
            QUD_weak_believe = f'Do you believe {clause}?'
            QUD_weak_think = f'Do you think {clause}?'
            QUD_strong = f'Do you know {clause}?'

        elif person == '3':
        #Sally can think/believe P
            believe_sentence = f'{np} {modal} believe {clause}.'
            think_sentence = f'{np} {modal} think {clause}.'
            QUD_weak_believe = f'Does {np} believe {clause}?'
            QUD_weak_think = f'Does {np} think {clause}?'
            QUD_strong = f'Does {np} know {clause}?'

        else:
            believe_sentence = f'{np} {modal} believe {clause}.'
            think_sentence = f'{np} {modal} think {clause}.'
            QUD_weak_believe = f'Do you believe {clause}?'
            QUD_weak_think = f'Do you think {clause}?'
            QUD_strong = f'Do you know {clause}?'
        

        stimulus = {
            'believe_sentence' : believe_sentence,
            'think_sentence' : think_sentence,
            'QUD_weak_believe' : QUD_weak_believe,
            'QUD_weak_think' : QUD_weak_think, 
            'QUD_strong' : QUD_strong,
            'factP' : p,
            'modal' : modals,
            'person' : person,
            'np' : np,
            'p' : clause,
            'item' : item
        }
        
        data.append(stimulus)

write_csv('data.csv', data)
