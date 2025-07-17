
var stimuli = [];
var fillers = [];
var stimuliLoaded = false; //tracking to make sure experiment doesn't start without loading//
var fillersLoaded = false;

//function for tracking whether data is loaded before starting//
function maybeStartExperiment() {
  if (stimuliLoaded && fillersLoaded) {
    startExperiment();
  }
}
//load data
Papa.parse('data_csv/data.csv', {
  download: true,
  header: true,
  complete: function(results) {
    stimuli = [];

    results.data.forEach(row => {
      if (row.sentence && row.context) {
        stimuli.push({
          believe_sentence: row.believe_sentence,
          think_sentence: row.think_sentence,
          QUD_weak_believe: row.QUD_weak_believe,
          QUD_weak_think: row.QUD_weak_think,
          QUD_strong: row.QUD_strong,
          factP: row.factP,
          modal: row.modal,
          person: row.person,
          np: row.np,
          item: row.item,
          type: 'test'
        });
      }
    });

    console.log('Stimuli loaded:', stimuli);
    stimuliLoaded = true;
    maybeStartExperiment();
  }
});

//load the filler csv
Papa.parse('data_csv/fillers.csv', {
  download: true,
  header: true,
  complete: function(results) {
    fillers = [];

    results.data.forEach(row => {
      if (row.sentence && row.context) {
        fillers.push({
          believe_sentence: row.believe_sentence,
          think_sentence: row.think_sentence,
          QUD_weak_believe: row.QUD_weak_believe,
          QUD_weak_think: row.QUD_weak_think,
          QUD_strong: row.QUD_strong,
          factP: row.factP,
          modal: row.modal,
          person: row.person,
          np: row.np,
          item: row.item,
          type: 'filler'
        });
      }
    });
    console.log('Fillers loaded:', fillers);
    fillersLoaded = true;
    maybeStartExperiment();
  }
});


//run experiment//
function startExperiment() {
  const jsPsych = initJsPsych({
    display_element: 'jspsych-target',
  });

  const participantID = jsPsych.randomization.randomID(10);
  jsPsych.data.addProperties({ participant_id: participantID });

  const condition = jsPsych.randomization.randomInt(0, 1) === 0 ? 'context' : 'no_context';
  const verb_condition = jsPsych.randomization.randomInt(0, 1) === 0 ? 'think' : 'believe';
  const QUD_weak = verb_condition === 'think' ? jsPsych.timelineVariable('QUD_weak_think') : jsPsych.timelineVariable('QUD_weak_believe')

  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
      ">
        <h3>Welcome to the experiment!</h3> 
        <p>Press SPACE to begin.</p>
      </div>
    `,
    choices: [' '],
  };

  const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <h1>Instructions</h1> 
      <p>In this study, you will be shown a series of sentences, each containing a statement from a fictional conversation. Your task is to evaluate what the speaker meant by what they said. Use the slider by placing the nob towards which ever answer you prefer. If you feel unclear about your answer, you can place the nob somewhere inbetween depending on how much or less you prefer each answer. There will be 20 items to complete. </p>
      <p>Press SPACE to continue.</p>
    `,
    choices: [' '],
  };

const context_template = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
      const QUD_strength = jsPsych.randomization.randomInt(0, 1) === 0 ? 'weak' : 'strong';
      const QUD = QUD_strength === 'weak' ? QUD_weak : jsPsych.timelineVariable('QUD_strong')
      const sentence = verb_condition === 'believe' ? jsPsych.timelineVariable('believe_sentence') : jsPsych.timelineVariable('think_sentence');
      const question = jsPsych.timelineVariable('np') === 'I' ? 'Does Jane mean that she does not know?' : `Does Jane mean that ${jsPsych.timelineVariable('np')} does not know?`;
    return `
      <div style="text-align: center;">
        <div class="context-block" style="margin-bottom: 96px;">
          <p>John: "${QUD}"</p>
          <p> <\p>
          <p>Jane: <strong>"${sentence}"</strong></p>
        </div>
        <div style="margin-top: 50px;">
          <p>${question}?</p>
        </div>
      </div>
    `;
  },
  labels: ['<p>Yes</p>', '<p>No</p>'],
  slider_width: 700,
  require_movement: true,
  button_label: 'Continue',
  data: function () {
    return {
      collect: true,
      trial_type: jsPsych.timelineVariable('type'),
      context: QUD,
      verb: verb_condition,
      factP: jsPsych.timelineVariable('factP'),
      modal: jsPsych.timelineVariable('modal'),
      person: jsPsych.timelineVariable('person'),
    };
  }
};

const No_context_template = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
      const QUD_strength = jsPsych.randomization.randomInt(0, 1) === 0 ? 'weak' : 'strong';
      const QUD = 'None'
      const sentence = verb_condition === 'believe' ? jsPsych.timelineVariable('believe_sentence') : jsPsych.timelineVariable('think_sentence');
      const question = jsPsych.timelineVariable('np') === 'I' ? 'Does Jane mean that she does not know?' : `Does Jane mean that ${jsPsych.timelineVariable('np')} does not know?`;
    return `
      <div style="text-align: center;">
        <div class="context-block" style="margin-bottom: 96px;">
          <p> <\p>
          <p>Jane: <strong>"${sentence}"</strong></p>
        </div>
        <div style="margin-top: 50px;">
          <p>${question}?</p>
        </div>
      </div>
    `;
  },
  labels: ['<p>Yes</p>', '<p>No</p>'],
  slider_width: 700,
  require_movement: true,
  button_label: 'Continue',
  data: function () {
    return {
      collect: true,
      trial_type: jsPsych.timelineVariable('type'),
      context: QUD,
      verb: verb_condition,
      factP: jsPsych.timelineVariable('factP'),
      modal: jsPsych.timelineVariable('modal'),
      person: jsPsych.timelineVariable('person'),
    };
  }
};

  //divide into modal and non modal trials
  const modalTrials = stimuli.filter(stim => stim.modal && stim.modal.trim() !== '');
  const nonModalTrials = stimuli.filter(stim => !stim.modal || stim.modal.trim() === '');

  //divide by person trials
  const person1_NonModalTrials = nonModalTrials.filter(stim => stim.person === '1');
  const person3_NonModalTrials = nonModalTrials.filter(stim => stim.person === '3');
  const person1_modalTrials = modalTrials.filter(stim => stim.person === '1');
  const person3_modalTrials = modalTrials.filter(stim => stim.person === '3');

  //divide by factP
  const trueP_person1_modalTrials = person1_modalTrials.filter(stim => stim.factP === '1');
  const trueP_person3_modalTrials = person3_modalTrials.filter(stim => stim.factP === '1');
  const trueP_person1_NonModalTrials = person1_NonModalTrials.filter(stim => stim.factP === '1');
  const trueP_person3_NonModalTrials = person3_NonModalTrials.filter(stim => stim.factP === '1');
  const falseP_person1_modalTrials = person1_modalTrials.filter(stim => stim.factP === '0');
  const falseP_person3_modalTrials = person3_modalTrials.filter(stim => stim.factP === '0');
  const falseP_person1_NonModalTrials = person1_NonModalTrials.filter(stim => stim.factP === '0');
  const falseP_person3_NonModalTrials = person3_NonModalTrials.filter(stim => stim.factP === '0');

  const conditions = [
    trueP_person1_modalTrials,
    trueP_person3_modalTrials,
    trueP_person1_NonModalTrials,
    trueP_person3_NonModalTrials,
    falseP_person1_modalTrials,
    falseP_person3_modalTrials,
    falseP_person1_NonModalTrials,
    falseP_person3_NonModalTrials
  ];

  let sampledTrials = [];
  conditions.forEach(condition => {
    //from the condition, sample 1 trial, this is to avoid showing a participant the same condition setting
    const sampledTrial = jsPsych.randomization.sampleWithoutReplacement(condition, 1);
    sampledTrials.push(sampledTrial);
  });
  //from the list with only one of each condition, sample 6 random trials
  const testTrials = jsPsych.randomization.sampleWithoutReplacement(sampledTrials, 6);
  const fillerTrials = jsPsych.randomization.sampleWithoutReplacement(fillers, 4)
 

    const combinedTrials = jsPsych.randomization.shuffle(
      testTrials.concat(fillerTrials)
    );
  console.log(combinedTrials); //to debug the trial list

  const trial_procedure = {
    timeline: [condition === 'context' ? context_template : No_context_template],
    timeline_variables: combinedTrials,
    randomize_order: false
  };

  //save data to osf
  const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: 'cmnR4NDGseyo',
    filename: `${participantID}.csv`,
    data_string: () =>
      jsPsych.data
        .get()
        .filter({ collect: true })
        .ignore([
          'trial_index',
          'plugin_version',
          'collect',
          'internal_node_id',
          'slider_start',
          'stimulus'
        ])
        .csv()
  };

  const finish = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <h1>Thank you for participating!</h1> 
      <p>You can close this tab.</p>
    `,
    choices: ['NO_KEYS'],
  };

  //run experiment
  jsPsych.run([
    welcome,
    instructions,
    trial_procedure,
    save_data,
    finish
  ]);
}