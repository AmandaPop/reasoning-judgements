var stimuli = [];

// Function for shuffling order of the data//
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

//Function for sampling from random order of data//
function random_sample(arr, n) {
    shuffled = shuffleArray(arr)
    return shuffled = arr.slice(0, n):
}

//Loads the csv data//
Papa.parse('data_csv/think_wiki.csv', {
download: true,
header: true,
complete: function(results) {
    const allStimuli = results.data.map(row => ({
    target: `<p>${row.target}</p>`,
    context: `<p>${row.context}</p>`
    }));
    stimuli = random_sample(allStimuli, 60)
    console.log('Stimuli loaded:', stimuli);
    startExperiment(); 
}
});

//Run experiment procedure
function startExperiment() {
  const jsPsych = initJsPsych({ display_element: 'jspsych-target' }); 

  var trial = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function() {
      return jsPsych.timelineVariable('target');
    },

    labels: ['0', '100'],
    require_movement: true,
    button_label: 'Continue'
  };

  var trial_procedure = {
    timeline: [trial],
    timeline_variables: stimuli,
    randomize_order: true
  };

  var timeline = [];
  timeline.push(trial_procedure);

  jsPsych.run(timeline); 
}