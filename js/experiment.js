var stimuli = [];

// Function for shuffling order of the data//
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

//Function for selecting first n items in shuffled data//
function random_sample(arr, n) {
    shuffled = shuffleArray(arr)
    return shuffled.slice(0, n)
}

//loads the csv data//
Papa.parse('data_csv/think_wiki.csv', {
download: true,
header: true,
complete: function(results) {
    const allStimuli = results.data.map(row => ({
    target: `<p>${row.target}</p>`,
    context: `<p>${row.context}</p>`
    }));
    stimuli = random_sample(allStimuli, 4)
    //remove this when experiment is ready//
    console.log('Stimuli loaded:', stimuli);
    startExperiment(); 
}
});

//run experiment//
function startExperiment() {
  const jsPsych = initJsPsych({
    display_element: 'jspsych-target',
  }); 

  const expID = cmnR4NDGseyo // this experiment ID is from DataPipe//
  //change this later to get the ID from prolific //
  const participantID = jsPsych.randomization.randomID(10);
  jsPsych.data.addProperties({participant_id: participant_id});
  //getting participantID from Prolific 
  // var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
  // jsPsych.data.addProperties({subject_id: subject_id});


  var welcome = {
    type: jsPsychHtmlKeyboardResponse, 
    //stimulus to display on the screen
    stimulus: `
    <h1>Welcome to the experiment!</h1> 
    <p>Instructions here.</p>
    <p>Press SPACE to begin.</p>
    `,
    choices: [' '], 
  };
  

  var trial = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function() {
      return jsPsych.timelineVariable('target');
    },
    prompt: 'How similar are the following two sentences?',
    labels: ['0', '100'],
    require_movement: true,
    button_label: 'Continue',
    data: {
    collect: true, 
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
               'collect', 'internal_node_id', 'slider_start'])
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