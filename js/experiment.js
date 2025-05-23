var stimuli = [];

Papa.parse('data_csv/think_wiki.csv', {
download: true,
header: true,
complete: function(results) {
    stimuli = results.data.map(row => ({
    target: `<p>${row.target}</p>`,
    context: `<p>${row.context}</p>`
    }));

    startExperiment(); 
}
});

function startExperiment() {
var trial = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function() {
    return jsPsych.timelineVariable('target');
    },
    prompt: function() {
    return jsPsych.timelineVariable('context');
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