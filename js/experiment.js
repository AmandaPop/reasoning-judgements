
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
        stimuli.push({
          believe_sentence: row.believe_sentence,
          think_sentence: row.think_sentence,
          QUD_weak_believe: row.QUD_weak_believe,
          QUD_weak_think: row.QUD_weak_think,
          QUD_strong: row.QUD_strong,
          factP: row.factP,
          person: row.person,
          np: row.np,
          p: row.p,
          item: row.item,
          type: 'test'
        });
      
    });

    
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
          p: row.p,
          item: row.item,
          type: 'filler'
        });
    });
    
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
  const verb_condition = jsPsych.randomization.randomInt(0, 1) === 0 ? 'think' : 'believe'; //just edit manually so only one verb at a time


  const consent = {
    type: jsPsychImageButtonResponse,
    stimulus: 'js/consent.png',
    choices: ['Continue']
  };

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
      <p>In this study, you will be shown a series of sentences, each containing a statement from a fictional conversation. Your task is to evaluate what the speaker meant by what they said. Use the slider by placing the knob toward whichever answer you prefer. If you feel unclear about your answer, you can place the knob somewhere in between the two options to show you are partially agreeing with one or the other. There will be 6 sentences to complete.</p>
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
        ? `Would you conclude from this that, according to Jane, she does not know ${trial.p}?`
        : `Would you conclude from this that, according to Jane, ${trial.np} does not know ${trial.p}?`;

      return {
        ...trial,
        context_text: QUD,
        sentence: sentence,
        question: question,
        verb: verb_condition
      };
    });
  }

  //template for both context/no-context now
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
    labels: ['<p>No</p>', '<p>Yes</p>'],
    slider_width: 500,
    require_movement: true,
    button_label: 'Continue',
    data: {
      collect: true,
      type: jsPsych.timelineVariable('type'),
      sentence: jsPsych.timelineVariable('sentence'),
      context: jsPsych.timelineVariable('context_text'),
      verb: jsPsych.timelineVariable('verb'),
      factP: jsPsych.timelineVariable('factP'),
      person: jsPsych.timelineVariable('person'),
      item: jsPsych.timelineVariable('item')
    }
  };

  //trial sampling
  const person1_Trials = stimuli.filter(stim => stim.person === '1');
  const person3_Trials = stimuli.filter(stim => stim.person === '3');

  const trueP_person1_Trials = person1_Trials.filter(stim => stim.factP === '1');
  const trueP_person3_Trials = person3_Trials.filter(stim => stim.factP === '1');
  const falseP_person1_Trials = person1_Trials.filter(stim => stim.factP === '0');
  const falseP_person3_Trials = person3_Trials.filter(stim => stim.factP === '0');

  const conditions = [
    trueP_person1_Trials,
    trueP_person3_Trials,
    falseP_person1_Trials,
    falseP_person3_Trials
  ];

  let sampledTrials = [];
  conditions.forEach(condition => {
    const sampledTrial = jsPsych.randomization.sampleWithoutReplacement(condition, 1)[0];
    sampledTrials.push(sampledTrial);
  });

  const testTrials = jsPsych.randomization.sampleWithoutReplacement(sampledTrials, 4);
  const fillerTrials = jsPsych.randomization.sampleWithoutReplacement(fillers, 2);
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
      <p>You will now be redirected to Prolific to complete the study.</p>
    `,
    choices: ['NO_KEYS'],
    trial_duration: 3000,
  };

  //run experiment
  jsPsych.run([
    consent,
    welcome,
    instructions,
    trial_procedure,
    save_data,
    finish
  ]);
}