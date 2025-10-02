
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

  // capture info from Prolific
  var participantID = jsPsych.data.getURLVariable('PROLIFIC_PID');
  var study_id = jsPsych.data.getURLVariable('STUDY_ID');
  var session_id = jsPsych.data.getURLVariable('SESSION_ID');

  jsPsych.data.addProperties({
    participantID: participantID,
    study_id: study_id,
    session_id: session_id
  });


  const condition = jsPsych.randomization.randomInt(0, 1) === 0 ? 'context' : 'no_context';
  const verb_condition = jsPsych.randomization.randomInt(0, 1) === 0 ? 'think' : 'believe'; //just edit manually so only one verb at a time


const consent = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="text-align: left; max-width: 800px; margin: auto; font-size: 16px;">
      <h1>Information About This UW Research Study</h1>
      <h2>Human Reasoning Judgements</h2>

      <h3>What is this study about?</h3>
      <p>
        You are being asked to participate in a research study about how people reason about the meaning of the language they hear during communication. 
        It is up to you to decide whether you want to participate. If you decide to enroll, you can stop participation at any time by leaving this page. 
        We are asking you to be in the study because you are a native speaker of English. Please read this form and ask any questions you may have before 
        agreeing to be in this study.
      </p>

      <h3>What will you be asked to do?</h3>
      <p>
        If you agree to be in this study, we will ask you to give your judgment on the intended meaning of various sentences. 
        The total time it should take to complete is around 6 minutes. Full instructions will be given on the next page.
      </p>

      <h3>What will happen to the information you provide?</h3>
      <p>
        The information you provide will be kept confidential. We will store the data with your Prolific ID instead of your name.
      </p>

      <h3>What can you do if you want more information?</h3>
      <p>
        <strong>Talk to the study team:</strong> Amanda Popadich is the lead researcher at the University of Washington for this study and can be contacted at 
        <a href="mailto:popadich@uw.edu">popadich@uw.edu</a>.<br>
        <strong>Talk to someone else:</strong> If you want to talk with someone who is not part of the study team about the study, your rights as a research subject, 
        or to report problems or complaints about the study, contact the UW Human Subjects Division at 
        <a href="mailto:hsdinfo@uw.edu">hsdinfo@uw.edu</a> or 206-543-0098.
      </p>

      <p><strong>Please click continue when you are ready to participate in this study.</strong></p>
    </div>
  `,
  choices: ['Continue'],
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
      <p>In this study, you will be shown a series of sentences, each containing a statement from a fictional conversation. Your task is to evaluate <strong>what the speaker meant by what they said</strong>. Use the slider by placing the knob toward whichever answer you prefer. If you feel unclear about your answer, you can place the knob somewhere in between the two options to show you are partially agreeing with one or the other. There will be 6 sentences to complete.</p>
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
      const no = trial.np === 'I'
        ? `No, Jane isn't saying anything about whether she knows.`
        : `No, Jane isn't saying anything about whether ${trial.np} knows.`;
      const yes = trial.np === 'I'
        ? `Yes, Jane means she does not know.`
        : `Yes, Jane means ${trial.np} does not know.`;
      return {
        ...trial,
        context_text: QUD,
        sentence: sentence,
        question: question,
        no: no,
        yes: yes,
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
    labels: function() {
      return [
        `<div style="width:150px; white-space:normal; text-align:center;">${jsPsych.timelineVariable('no')}</div>`,
        `<div style="width:150px; white-space:normal; text-align:center;">${jsPsych.timelineVariable('yes')}</div>`
      ];
    },
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

const feedback = {
  type: jsPsychSurveyText,
  questions: [
    {prompt: 'What specific strategies did you use to answer each question?', name: 'strategies'},
    {prompt: 'Do you have any comments or thoughts on the experiment?', name: 'comments'}
  ],
  data: {
    collect: true,
    trial_type: 'feedback'
  },
  on_finish: function(data) {
    // ove responses out of the nested object so they don’t get dropped
    data.strategies = data.response.strategies;
    data.comments = data.response.comments;
    delete data.response; // optional: keeps CSV tidy
  }
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

  var finish = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<p>Thank you for participating!</p>
    <p><a href="https://app.prolific.com/submissions/complete?cc=C13PMME4">Click here to return to Prolific and complete the study</a>.</p>`,
  choices: "NO_KEYS"
  };

  //run experiment
  jsPsych.run([
    consent,
    welcome,
    instructions,
    trial_procedure,
    feedback,
    save_data,
    finish
  ]);
}