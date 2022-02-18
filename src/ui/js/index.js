import * as bootstrap from 'bootstrap';
import { addAnswer, deleteLastAnswer } from './addOrDeleteAnswer';

window.bootstrap = bootstrap;
window.addAnswer = addAnswer;
window.deleteLastAnswer = deleteLastAnswer;

document.querySelector('#addAnswerButton').addEventListener('click', addAnswer);
document
  .querySelector('#deleteAnswerButton')
  .addEventListener('click', deleteLastAnswer);

document.querySelector('#trashQuestion').addEventListener('click', (e) => {
  if (!confirm('Möchtest du diese Frage wirklich löschen?')) {
    e.preventDefault();
  }
});

const openClosePollButton = document.querySelector('#openClosePoll');
openClosePollButton.addEventListener('click', (e) => {
  e.preventDefault();
  fetch(openClosePollButton.getAttribute('href')).then((_) => {
    location.reload(true);
  });
});
