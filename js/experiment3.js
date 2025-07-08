//NEED TO CHANGE FILES TO CHANGE VERB//

var stimuli = [];
var fillers = [];
var stimuliLoaded = false; //tracking to make sure experiment doesn't start without loading//
var fillersLoaded = false;

//console.log('This is the most recent version')

//function for tracking whether data is loaded before starting//
function maybeStartExperiment() {
  if (stimuliLoaded && fillersLoaded) {
    startExperiment();
  }
}

Papa.parse('data_csv/data.csv', {
  download: true,
  header: true,
  complete: function(results) {
    stimuli = [];

    results.data.forEach(row => {
      if (row.sentence && row.context) {
        stimuli.push({
          sentence: row.sentence,
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
Papa.parse('data_csv/fillers_think.csv', {
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
      <p>This experiment is seeking your feedback on different sentences containing the word think. All the sentences have been taken from Wikipedia articles. What we want to know is whether the way the sentence is phrased could make sense given the rest of the context of the article that is shown. If it is an acceptable sentence for that context, use the slider to place the nob on the scale depending on how acceptable you feel the sentence is. </p>
      <p>Once you go forward in the experiment you are unable to go backwards so only click continue when you are ready. There will be two test trials where we describe the question in more detail to give you a hang of it. Afterward, there will be 15 test trials.  </p>
      <p>Press SPACE to continue.</p>
    `,
    choices: [' '],
  };
    //placeholder if consent form is necessary
    const consent_form = {
        type: jsPsychImageButtonResponse,
        stimulus: './consent_placeholder.png',
        choices: ['Decline', 'Accept'],
        prompt: "<p>Do you wish to participate?</p>"
    };

    const example_noSI = {
      type: jsPsychHtmlSliderResponse,
      stimulus: `
        <div style="text-align: center;">
          <div class="context-block" style="margin-bottom: 96px;">
            <p>John has been working on the company’s payroll system for over five years. He personally ran the final checks this morning before the direct deposits were triggered. He also received confirmation emails from both the payroll software and the bank. At lunch, several coworkers mentioned already seeing the deposit in their accounts. Everything about the process went exactly as it always does.</p>
          </div>
          <div>
            <p><strong>John thinks and possibly knows that everyone has been paid now.</strong></p>
          </div>
        </div>
      `,
        prompt: 'not know?<br>',
        labels: [
          '<div style="text-align: center;"><span>Completely</span><br><span>unacceptable</span></div>',
          '<div style="text-align: center;"><span>Completely</span><br><span>acceptable</span></div>'
        ],
        slider_width: 700,
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
            <p><strong>It is thought but not known that the permafrost definitely will melt substantially in the next 5 years.</strong></p>
          </div>
        </div>
      `,
        prompt: 'How acceptable is this sentence?<br>',
        labels: [
          '<div style="text-align: center;"><span>Completely</span><br><span>unacceptable</span></div>',
          '<div style="text-align: center;"><span>Completely</span><br><span>acceptable</span></div>'
          ],
        slider_width: 700,
        require_movement: true,
        button_label: 'Continue',
    }

    const ready_to_begin = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <p>Now you are ready to begin.</p>
      <p> The instructions are repreated below for a reminder.</p>
        <p>This experiment is seeking your feedback on different sentences containing the word think. All the sentences have been taken from Wikipedia articles. What we want to know is whether the way the sentence is phrased could make sense given the rest of the context of the article that is shown. If it is an acceptable sentence for that context, use the slider to place the nob on the scale depending on how acceptable you feel the sentence is. </p>
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
            <p>${jsPsych.timelineVariable('context')}</p>
          </div>
          <div>
            <p><strong>${jsPsych.timelineVariable(sentence)}</strong></p>
          </div>
        </div>
      `;
    },
    prompt: 'Does the speaker know?<br>',
    labels: [
  '<div style="text-align: center;"><span>Completely</span><br><span>unacceptable</span></div>',
  '<div style="text-align: center;"><span>Completely</span><br><span>acceptable</span></div>'
    ],
    slider_width: 800,
    require_movement: true,
    button_label: 'Continue',
    data: {
      collect: true,
      trial_type: jsPsych.timelineVariable('type'),
      sentence: jsPsych.timelineVariable('sentence'),
      context: jsPsych.timelineVariable('context'),
      verb: jsPsych.timelineVariable('verb'),
      factP: jsPsych.timelineVariable('factP'),
      modal: jsPsych.timelineVariable('modal'),
      person: jsPsych.timelineVariable('person'),
      conditional: jsPsych.timelineVariable('conditional')
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
    ready_to_begin, 
    trial_procedure, 
    save_data, 
    finish]);
}
