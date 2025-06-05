var stimuli = [];
var fillers = [];
var stimuliLoaded = false; //tracking to make sure experiment doesn't start without loading
var fillersLoaded = false;

//function for tracking whether data is loaded before starting
function maybeStartExperiment() {
  if (stimuliLoaded && fillersLoaded) {
    startExperiment();
  }
}

//loads the csv data//
Papa.parse('data_csv/test_stimuli.csv', {
  download: true,
  header: true,
  complete: function(results) {
    stimuli = results.data.map(row => ({
      original: row.original,
      target: `${row.target}`,
      context: `${row.context}`,
      tense: row.tense,
      form: row.form,
      person: row.person
    }));
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
    fillers = results.data.map(row => ({
      original: row.original,
      target: `${row.target}`,
      context: `${row.context}`,
      tense: row.tense,
      form: row.form,
      person: row.person
    }));
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

  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <h3>Welcome to the experiment!</h3> 
      <p>Instructions here.</p>
      <p>Press SPACE to begin.</p>
    `,
    choices: [' '],
  };

  const trial_template = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function () {
      return `
        <div style="text-align: center;">
          <div class="context-block" style="margin-bottom: 96px;">
            <p>${jsPsych.timelineVariable('context')}</p>
          </div>
          <div>
            <p><strong>A:</strong> ${jsPsych.timelineVariable('original')}</p>
            <p><strong>B:</strong> ${jsPsych.timelineVariable('target')}</p>
          </div>
        </div>
      `;
    },
    prompt: 'Which sentence is a better continuation/makes more sense/is more likely to be true?<br>',
    labels: ['<strong>A</strong>', '<strong>B</strong>'],
    require_movement: true,
    button_label: 'Continue',
    data: {
      collect: true,
      trial_type: jsPsych.timelineVariable('type'),
      original: jsPsych.timelineVariable('original'),
      target: jsPsych.timelineVariable('target'),
      context: jsPsych.timelineVariable('context'),
      tense: jsPsych.timelineVariable('tense'),
      form: jsPsych.timelineVariable('form'),
      person: jsPsych.timelineVariable('person')
    },
  };

  //choose randomly sampled stimuli and random order of fillers
  const testTrials = jsPsych.randomization
    .sampleWithoutReplacement(stimuli, 12)
    .map(stim => ({ ...stim, type: 'test' }));
  const fillerTrials = fillers.map(filler => ({ ...filler, type: 'filler' }));

  //combine and shuffle all trials
  const combinedTrials = jsPsych.randomization.shuffle(testTrials.concat(fillerTrials));

  const trial_procedure = {
    timeline: [trial_template],
    timeline_variables: combinedTrials,
    randomize_order: false //already shuffled
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
          'trial_type',
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

  jsPsych.run([welcome, trial_procedure, save_data, finish]);
}