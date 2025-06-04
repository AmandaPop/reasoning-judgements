var stimuli = [];

//function for shuffling order of the data//
//function shuffleArray(array) {
   // for (let i = array.length - 1; i > 0; i--) {
   //     const j = Math.floor(Math.random() * (i + 1));
   //     [array[i], array[j]] = [array[j], array[i]];
   // }
    //return array
//}

//function for selecting first n items in shuffled data//
function random_sample(arr, n) {
    shuffled = jsPsych.randomization.repeat(arr, 1);
    return shuffled.slice(0, n)
}

//loads the csv data//
Papa.parse('data_csv/test_stimuli.csv', {
download: true,
header: true,
complete: function(results) {
    const allStimuli = results.data.map(row => ({
    original: row.original,
    target: `${row.target}`,
    context: `${row.context}`,
    tense: row.tense,
    form: row.form,
    person: row.person
    }));
    stimuli = random_sample(allStimuli, 7)
    //print to console to see whats going on//
    console.log('Stimuli loaded:', stimuli);
    startExperiment(); 
}
});

//run experiment//
function startExperiment() {
  const jsPsych = initJsPsych({
    display_element: 'jspsych-target',
  }); 

  const expID = 'cmnR4NDGseyo' // this experiment ID is from DataPipe//
  //change this later to get the ID from prolific //
  const participantID = jsPsych.randomization.randomID(10);
  jsPsych.data.addProperties({participant_id: participantID});
  //getting participantID from Prolific 
  // var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
  // jsPsych.data.addProperties({subject_id: subject_id});


  var welcome = {
    type: jsPsychHtmlKeyboardResponse, 
    //stimulus to display on the screen//
    stimulus: `
    <h3>Welcome to the experiment!</h3> 
    <p>Instructions here.</p>
    <p>Press SPACE to begin.</p>
    `,
    choices: [' '], 
  };
  

  var trial = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function() {
      return `
        <div style="text-align: center;">
          <div class="context-block" style="margin-bottom: 96px;">
            <p>${jsPsych.timelineVariable('context')}</p>
          </div>
          <div style="text-align: center;">
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
      original: jsPsych.timelineVariable('original'),
      target: jsPsych.timelineVariable('target'),
      context: jsPsych.timelineVariable('context'),
      tense: jsPsych.timelineVariable('tense'),
      form: jsPsych.timelineVariable('form'),
      person: jsPsych.timelineVariable('person')
    },
  };

  var trial_procedure = {
    timeline: [trial],
    timeline_variables: stimuli,
    randomize_order: true
  };

  const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: expID, 
  filename: `${participantID}.csv`,
  data_string: ()=> jsPsych.data
        .get()
        .filter({ collect: true }) 
        .ignore(['trial_type', 'trial_index', 'plugin_version',
               'collect', 'internal_node_id', 'slider_start', 'stimulus']) //also ignoring stimulus because that is both target and original sentence//
        .csv()
  };

  var finish = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <h1>Thank you for participating!</h1> 
    <p>You can close this tab.</p>
    `,
    choices: ['NO_KEYS'],
  };
  

  var timeline = [];
  timeline.push(welcome);
  timeline.push(trial_procedure);
  timeline.push(save_data);
  timeline.push(finish);

  jsPsych.run(timeline); 
  }