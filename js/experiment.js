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

//loads the csv data//
Papa.parse('data_csv/believe.csv', {
  download: true,
  header: true,
  complete: function(results) {

    stimuli = [];

    results.data.forEach(row => {
      try {
        //convert context string to valid array
        const parsedContext = JSON.parse(row.context.replace(/'/g, '"'));

        //only add to stimuli if parsing was successful
        stimuli.push({
          original: row.original,
          target: row.target,
          context: parsedContext,
          tense: row.tense,
          form: row.form,
          person: row.person
        });
        //for incase any lines break this during loading, just skip that line
      } catch (e) {
        //skip the row
      }
    });

    //console.log('Stimuli loaded:', stimuli);
    stimuliLoaded = true;
    maybeStartExperiment(); 
  }
});

//load the filler csv
Papa.parse('data_csv/fillers_believe.csv', {
  download: true,
  header: true,
  complete: function(results) {
    fillers = [];
    results.data.forEach(row => {
      try {
        const parsedContext = JSON.parse(row.context.replace(/'/g, '"'));

        fillers.push({
          original: row.original,
          target: row.target,
          context: parsedContext,
          tense: row.tense,
          form: row.form,
          person: row.person
        });
      } catch (e) {
        //skip row
      }
    });

    //console.log('Fillers loaded:', fillers);
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

  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <h3>Welcome to the experiment!</h3> 
      <p>Instructions here.</p>
      <p>Press SPACE to begin.</p>
    `,
    choices: [' '],
  };

    const instructions= {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <h1>Instructions</h1> 
      <p>We are interested in your thoughts on how likely certain sentences are to be a continuation of the last. 
      We will show you a set of sentences, each taken from a wikipedia article, and ask that you select which sentence is more or less likely to be said next.
      The slider is used by placing the nob somewhere between the sentences according to which sentence you prefer.  
      The next two pages will show you examples.</p>
      <p>Press SPACE to continue.</p>
    `,
    choices: [' '],
  };

    const example_noSI = {
      type: jsPsychHtmlSliderResponse,
      stimulus: `
        <div style="text-align: center;">
          <div class="context-block" style="margin-bottom: 96px;">
            <p>John has been working on the company’s payroll system for over five years. He personally ran the final checks this morning before the direct deposits were triggered. He also received confirmation emails from both the payroll software and the bank. At lunch, several coworkers mentioned already seeing the deposit in their accounts. Everything about the process went exactly as it always does.</p>
          </div>
          <div>
            <p><strong>A:</strong>John thinks and possibly knows that everyone has been paid now</p>
            <p><strong>B:</strong>John thinks but doesn't know that everyone has been paid</p>
          </div>
        </div>
      `,
        prompt: 'Which sentence is a better continuation/makes more sense/is more likely to be true?<br>',
        labels: ['<strong>A</strong>', '<strong>B</strong>'],
        require_movement: true,
        button_label: 'Continue',
    }

        const example_SI = {
      type: jsPsychHtmlSliderResponse,
      stimulus: `
        <div style="text-align: center;">
          <div class="context-block" style="margin-bottom: 96px;">
            <p>Much of Northern Canada is covered by ice and permafrost. The future of the permafrost is uncertain because the Arctic has been warming at three times the global average as a result of climate change in Canada. Canada's annual average temperature over land has risen by 1.7 °C (3.1 °F), with changes ranging from 1.1 to 2.3 °C (2.0 to 4.1 °F) in various regions, since 1948. 
            </p>
          </div>
          <div>
            <p><strong>A:</strong>It is thought and possibly known that the permafrost definitely will melt substantially in the next 5 years.</p>
            <p><strong>B:</strong>It is thought but not known that the permafrost definitely will melt substantially in the next 5 years.</p>
          </div>
        </div>
      `,
        prompt: 'Which sentence is a better continuation/makes more sense/is more likely to be true?<br>',
        labels: ['<strong>A</strong>', '<strong>B</strong>'],
        require_movement: true,
        button_label: 'Continue',
    }

    const ready_to_begin = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <p>Now you are ready to begin.</p>
      <p>Press SPACE to start.</p>
    `,
    choices: [' '],
  };

  const trial_template = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function () {
      const contextArray = jsPsych.timelineVariable('context');
      const contextText = contextArray.join(' ')
      return `
        <div style="text-align: center;">
          <div class="context-block" style="margin-bottom: 96px;">
            <p>${contextText}</p>
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

  jsPsych.run([welcome, 
    instructions, 
    example_SI, 
    example_noSI, 
    ready_to_begin, 
    trial_procedure, 
    save_data, 
    finish]);
}