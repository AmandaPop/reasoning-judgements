//NEED TO CHANGE FILES TO CHANGE VERB//

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
          no_SI: row.No_SI,
          context: row.context,  
          verb: row.verb,
          factP: row.factP,
          modal: row.modal,
          person: row.person,
          conditional: row.conditional
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
          no_SI: row.No_SI,
          context: row.context,  
          verb: row.verb,
          factP: row.factP,
          modal: row.modal,
          person: row.person,
          conditional: row.conditional
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
  }
    );

  const participantID = jsPsych.randomization.randomID(10);
  jsPsych.data.addProperties({ participant_id: participantID });
    const random_int = jsPsych.randomization.randomInt(0,1)
  let condition;
  if (random_int == 0){
    condition = 'context'
  } else {
    condition = 'no_context'
  }

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

  const instructions= {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <h1>Instructions</h1> 
      <p>This is the instructions </p>
      <p>Once you go forward in the experiment you are unable to go backwards so only click continue when you are ready. There will be two test trials where we describe the question in more detail to give you a hang of it. Afterward, there will be 15 test trials.  </p>
      <p>Press SPACE to continue.</p>
    `,
    choices: [' '],
  };

const context_template = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
    const i = jsPsych.randomization.randomInt(0,1);
    const sentenceKey = i === 0 ? 'SI' : 'No_SI';
    const sentence = jsPsych.timelineVariable(sentenceKey);

    return `
      <div style="text-align: center;">
        <div class="context-block" style="margin-bottom: 96px;">
          <p>${jsPsych.timelineVariable('context')}</p>
        </div>
        <div>
          <p><strong>${sentence}</strong></p>
        </div>
      </div>
    `;
  },
  prompt: "Does the speaker mean that they don't know?",
  labels: ['Yes', 'No'],
  slider_width: 800,
  require_movement: true,
  button_label: 'Continue',
  data: function() {
    const i = jsPsych.randomization.randomInt(0,1);
    const sentenceKey = i === 0 ? 'SI' : 'No_SI';
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
      conditional: jsPsych.timelineVariable('conditional')
    };
  }
};

const No_context_template = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
    const i = jsPsych.randomization.randomInt(0,1);
    const sentenceKey = i === 0 ? 'SI' : 'No_SI';
    const sentence = jsPsych.timelineVariable(sentenceKey);

    return `
      <div style="text-align: center;">
        <p><strong>${sentence}</strong></p>
      </div>
    `;
  },
  prompt: "Does the speaker mean that they don't know?",
  labels: ['Yes', 'No'],
  slider_width: 800,
  require_movement: true,
  button_label: 'Continue',
  data: function() {
    const i = jsPsych.randomization.randomInt(0,1);
    const sentenceKey = i === 0 ? 'SI' : 'No_SI';
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
      conditional: jsPsych.timelineVariable('conditional')
    };
  }
};


  //choose randomly sampled stimuli and random order of fillers - total 15
  const testTrials = jsPsych.randomization
    .sampleWithoutReplacement(stimuli, 12)
    .map(stim => ({ ...stim, type: 'test' }));
  const fillerTrials = jsPsych.randomization
    .sampleWithoutReplacement(fillers, 3)
    .map(filler => ({ ...filler, type: 'filler' }));
  //combine and shuffle all trials
  const combinedTrials = jsPsych.randomization.shuffle(testTrials.concat(fillerTrials));
  console.log(combinedTrials); //testing to find whats in my trial data

  //depending on context or no context condition show that type of trial
  let trial_procedure;
  if (condition == 'context') {
      trial_procedure = {
      timeline: [context_template],
      timeline_variables: combinedTrials,
      randomize_order: false //already shuffled
  };
  } else {
      trial_procedure = {
      timeline: [No_context_template],
      timeline_variables: combinedTrials,
      randomize_order: false //already shuffled
  };
  }

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

  jsPsych.run([welcome, 
    instructions, 
    trial_procedure, 
    save_data, 
    finish]);
}
