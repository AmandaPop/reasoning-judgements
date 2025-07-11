console.log('This is the 2 version update')
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
          sentence: row.sentence,
          SI: row.SI,
          No_SI: row.No_SI,
          context: row.context,  
          verb: row.verb,
          factP: row.factP,
          modal: row.modal,
          person: row.person,
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
          sentence: row.sentence,
          SI: row.SI,
          No_SI: row.No_SI,
          context: row.context,  
          verb: row.verb,
          factP: row.factP,
          modal: row.modal,
          person: row.person,
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
      <p>In this study, you will be shown a series of sentences, each containing a statement from a fictional conversation. Your task is to evaluate how acceptable each sentence sounds. On each trial, the sentence which you are being asked to evaluate is bolded. There will be 20 items to complete. </p>
      <p>Press SPACE to continue.</p>
    `,
    choices: [' '],
  };

const context_template = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
      const sentenceKey = jsPsych.timelineVariable('sentenceKey');
      const sentence = jsPsych.timelineVariable(sentenceKey);

    return `
      <div style="text-align: center;">
        <div class="context-block" style="margin-bottom: 96px;">
          <p>Speaker A: ${jsPsych.timelineVariable('context')}</p>
          <p> Speaker B:<\p>
          <p> A: <strong>${jsPsych.timelineVariable('SI')}</strong>
          <p> B: <strong>${jsPsych.timelineVariable('No_SI')}</strong>
        </div>
        <div style="margin-top: 50px;">
          <p>Which sentence makes more sense?</p>
        </div>
      </div>
    `;
  },
  labels: ['<p>A</p>', '<p>B</p>'],
  slider_width: 700,
  require_movement: true,
  button_label: 'Continue',
  data: function () {
    const sentenceKey = jsPsych.timelineVariable('sentenceKey');
    return {
      collect: true,
      trial_type: jsPsych.timelineVariable('type'),
      sentence: jsPsych.timelineVariable(sentenceKey),
      sentence_type: sentenceKey,
      context: jsPsych.timelineVariable('context'),
      verb: jsPsych.timelineVariable('verb'),
      factP: jsPsych.timelineVariable('factP'),
      modal: jsPsych.timelineVariable('modal'),
      person: jsPsych.timelineVariable('person'),
    };
  }
};

const No_context_template = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
      const sentenceKey = jsPsych.timelineVariable('sentenceKey');
      const sentence = jsPsych.timelineVariable(sentenceKey);

    return `
      <div style="text-align: center;">
        <div class="context-block" style="margin-bottom: 96px;">
          <p> A: <strong>${jsPsych.timelineVariable('SI')}</strong>
          <p> B: <strong>${jsPsych.timelineVariable('No_SI')}</strong>
        </div>
        <div style="margin-top: 50px;">
          <p>Which sentence makes more sense?</p>
        </div>
      </div>
    `;
  },
  labels: ['<p>A</p>', '<p>B</p>'],
  slider_width: 700,
  require_movement: true,
  button_label: 'Continue',
  data: function () {
    const sentenceKey = jsPsych.timelineVariable('sentenceKey');
    return {
      collect: true,
      trial_type: jsPsych.timelineVariable('type'),
      sentence: jsPsych.timelineVariable(sentenceKey),
      sentence_type: sentenceKey,
      context: 'None',
      verb: jsPsych.timelineVariable('verb'),
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

  let testTrials = [];
  conditions.forEach(condition => {
    //first just sample two trials from this condition
    const sampledTrials = jsPsych.randomization.sampleWithoutReplacement(condition, 2);
    //label one to be the SI version and one the no SI version
    const siTrial = { ...sampledTrials[0], sentenceKey: 'SI'};
    const noSITrial = { ...sampledTrials[1], sentenceKey: 'No_SI'};
    testTrials.push(siTrial, noSITrial);
  });

  const fillerTrials = jsPsych.randomization
    .sampleWithoutReplacement(fillers, 4)
    .map(filler => {
      const sentenceKey = jsPsych.randomization.sampleWithoutReplacement(['SI', 'No_SI'], 1)[0];
      return { ...filler, sentenceKey };
    });

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