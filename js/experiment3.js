
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
      <p>This is the instructions</p>
      <p>Once you go forward in the experiment you are unable to go backwards, so only click continue when you are ready. There will be two test trials where we describe the question in more detail to give you a hang of it. Afterward, there will be 15 test trials.</p>
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
          <p> <\p>
          <p>Speaker B: <strong>${sentence}</strong></p>
        </div>
        <div style="margin-top: 50px;">
          <p>How acceptable is this sentence?</p>
        </div>
      </div>
    `;
  },
  labels: ['<p>Completely\n Acceptable</p>', '<p>Completely\n Unacceptable</p>'],
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
          <p>Speaker B: <strong>${sentence}</strong></p>
        </div>
        <div style="margin-top: 50px;">
          <p>How acceptable is this sentence?</p>
        </div>
      </div>
    `;
  },
  labels: ['<p>Completely\n Acceptable</p>', '<p>Completely\n Unacceptable</p>'],
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


  //create combined trials with random SI/No_SI selection
  /*
  const testTrials = jsPsych.randomization
    .sampleWithoutReplacement(stimuli, 12)
    .map(stim => ({ ...stim, type: 'test' }));

  const fillerTrials = jsPsych.randomization
    .sampleWithoutReplacement(fillers, 3)
    .map(filler => ({ ...filler, type: 'filler' }));

  const combinedTrials = jsPsych.randomization.shuffle(
    testTrials.concat(fillerTrials)
  ).map(trial => {
    const sentenceKey = jsPsych.randomization.sampleWithoutReplacement(['SI', 'No_SI'], 1)[0];
    return { ...trial, sentenceKey };
  }); */

  //separate stimuli into four groups based on modal and SI status
  const modalTrials = stimuli.filter(stim => stim.modal && stim.modal.trim() !== '');
  const nonModalTrials = stimuli.filter(stim => !stim.modal || stim.modal.trim() === '');

  const modal_SI = jsPsych.randomization.shuffle(modalTrials).slice(0, 6).map(stim => ({ ...stim, sentenceKey: 'SI' }));
  const modal_No_SI = jsPsych.randomization.shuffle(modalTrials).slice(6, 12).map(stim => ({ ...stim, sentenceKey: 'No_SI' }));

  const nonModal_SI = jsPsych.randomization.shuffle(nonModalTrials).slice(0, 6).map(stim => ({ ...stim, sentenceKey: 'SI' }));
  const nonModal_No_SI = jsPsych.randomization.shuffle(nonModalTrials).slice(6, 12).map(stim => ({ ...stim, sentenceKey: 'No_SI' }));

  //sample 3 from each group
  const selectedModalSI = jsPsych.randomization.sampleWithoutReplacement(modal_SI, 3);
  const selectedModalNoSI = jsPsych.randomization.sampleWithoutReplacement(modal_No_SI, 3);
  const selectedNonModalSI = jsPsych.randomization.sampleWithoutReplacement(nonModal_SI, 3);
  const selectedNonModalNoSI = jsPsych.randomization.sampleWithoutReplacement(nonModal_No_SI, 3);

  //combine and shuffle
  const testTrials = jsPsych.randomization.shuffle([
    ...selectedModalSI,
    ...selectedModalNoSI,
    ...selectedNonModalSI,
    ...selectedNonModalNoSI
  ]);

  const fillerTrials = jsPsych.randomization
    .sampleWithoutReplacement(fillers, 3)
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