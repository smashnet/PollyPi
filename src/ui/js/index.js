import * as bootstrap from 'bootstrap';
import { addAnswer, deleteLastAnswer } from './addOrDeleteAnswer';

window.bootstrap = bootstrap;
window.addAnswer = addAnswer;
window.deleteLastAnswer = deleteLastAnswer;

document.querySelector('#addAnswerButton').addEventListener('click', addAnswer);
document
  .querySelector('#deleteAnswerButton')
  .addEventListener('click', deleteLastAnswer);
