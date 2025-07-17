
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
Papa.parse('data_csv/sentences.csv', {
  download: true,
  header: true,
  complete: function(results) {
    stimuli = [];

    results.data.forEach(row => {
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
      <p>In this study, you will be shown a series of sentences, each containing a statement from a fictional conversation. Your task is to evaluate what the speaker meant by what they said. Use the slider by placing the knob toward whichever answer you prefer. If you feel unclear about your answer, you can place the knob somewhere in between. There will be 20 items to complete.</p>
      <p>Press SPACE to continue.</p>
    `,
    choices: [' '],
  };

  //create correct trials with QUD/sentence/question values
  function generateTrialVariables(trials, context_condition, verb_condition) {
    return trials.map(trial => {
      const QUD_strength = jsPsych.randomization.randomInt(0, 1) === 0 ? 'weak' : 'strong';

      let QUD;
      if (context_condition === 'context') {
        QUD = (QUD_strength === 'weak')
          ? (verb_condition === 'think' ? trial.QUD_weak_think : trial.QUD_weak_believe)
          : trial.QUD_strong;
      } else {
        QUD = 'None';
      }

      const sentence = verb_condition === 'believe' ? trial.believe_sentence : trial.think_sentence;
      const question = trial.np === 'I'
        ? 'Does Jane mean that she does not know?'
        : `Does Jane mean that ${trial.np} does not know?`;

      return {
        ...trial,
        context_text: QUD,
        sentence: sentence,
        question: question,
        verb: verb_condition
      };
    });
  }

  // Unified response template for both context/no-context
  const response_template = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function () {
      const contextHTML = jsPsych.timelineVariable('context_text') === 'None'
        ? ''
        : `<p>John: "${jsPsych.timelineVariable('context_text')}"</p>`;
      return `
        <div style="text-align: center;">
          <div class="context-block" style="margin-bottom: 96px;">
            ${contextHTML}
            <p>Jane: <strong>"${jsPsych.timelineVariable('sentence')}"</strong></p>
          </div>
          <div style="margin-top: 50px;">
            <p>${jsPsych.timelineVariable('question')}</p>
          </div>
        </div>
      `;
    },
    labels: ['<p>Yes</p>', '<p>No</p>'],
    slider_width: 700,
    require_movement: true,
    button_label: 'Continue',
    data: {
      collect: true,
      trial_type: jsPsych.timelineVariable('type'),
      context: jsPsych.timelineVariable('context_text'),
      verb: jsPsych.timelineVariable('verb'),
      factP: jsPsych.timelineVariable('factP'),
      modal: jsPsych.timelineVariable('modal'),
      person: jsPsych.timelineVariable('person'),
      sentence: jsPsych.timelineVariable('sentence')
    }
  };

  //trial sampling
  const modalTrials = stimuli.filter(stim => stim.modal === 'modal');
  const nonModalTrials = stimuli.filter(stim => stim.modal === '');

  const person1_NonModalTrials = nonModalTrials.filter(stim => stim.person === '1');
  const person3_NonModalTrials = nonModalTrials.filter(stim => stim.person === '3');
  const person1_modalTrials = modalTrials.filter(stim => stim.person === '1');
  const person3_modalTrials = modalTrials.filter(stim => stim.person === '3');

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
    const sampledTrial = jsPsych.randomization.sampleWithoutReplacement(condition, 1)[0];
    sampledTrials.push(sampledTrial);
  });

  const testTrials = jsPsych.randomization.sampleWithoutReplacement(sampledTrials, 6);
  const fillerTrials = jsPsych.randomization.sampleWithoutReplacement(fillers, 4);
  const combinedTrials = jsPsych.randomization.shuffle(testTrials.concat(fillerTrials));
  const preparedTrials = generateTrialVariables(combinedTrials, condition, verb_condition);

  const trial_procedure = {
    timeline: [response_template],
    timeline_variables: preparedTrials,
    randomize_order: false
  };

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