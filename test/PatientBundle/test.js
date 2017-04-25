
const pb = require('../../lib/PatientBundle');
const message = require('./fixtures/plain_message.json');

// Start a new patient bundle.
var myPatient = new pb.PatientBundle();

// Parse the message and append to myPatient.
pb.parseMessage(message, myPatient);
//pb.parseMessage(message, myPatient); // This also works

// No test for now.  Just output to the screen.
console.log(myPatient.getBundle());
console.log(myPatient.getBundle().entry);

// Parse the message and append to myPatient.
let myOtherPatient = pb.parseMessage(message);
//pb.parseMessage(message, myPatient); // This also works

// No test for now.  Just output to the screen.
console.log(myOtherPatient.getBundle());
console.log(myOtherPatient.getBundle().entry);
