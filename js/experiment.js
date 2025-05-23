const jsPsych = initJsPsych();

const hello_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Hello world!'
}

jsPsych.run([hello_trial]);