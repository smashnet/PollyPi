let currentAnswerName = 'B';

export function addAnswer(event) {
  currentAnswerName = nextCharacter(currentAnswerName);
  event.preventDefault();
  let questionForm = document.querySelector('#questionForm');
  let deleteAnswerButton = document.querySelector('#deleteAnswerButton');
  let answerDiv = document.createElement('div');
  answerDiv.setAttribute('id', `divAnswer${currentAnswerName}`);
  answerDiv.classList.add('mb-3');
  let answerLabel = document.createElement('label');
  answerLabel.setAttribute('for', `inputAnswer${currentAnswerName}`);
  answerLabel.classList.add('form-label');
  let answerLabelText = document.createTextNode(
    `Antwortmöglichkeit ${currentAnswerName}`,
  );
  answerLabel.appendChild(answerLabelText);
  let answerInput = document.createElement('input');
  answerInput.setAttribute('type', 'text');
  answerInput.setAttribute('name', `answerOptions`);
  answerInput.setAttribute('id', `inputAnswer${currentAnswerName}`);
  answerInput.classList.add('form-control');
  answerInput.classList.add('form-control-sm');

  answerDiv.appendChild(answerLabel);
  answerDiv.appendChild(answerInput);

  questionForm.insertBefore(answerDiv, deleteAnswerButton);
}

export function deleteLastAnswer(e) {
  e.preventDefault();
  let lastAnswer = document.querySelector(`#divAnswer${currentAnswerName}`);
  lastAnswer.remove();
  currentAnswerName = prevCharacter(currentAnswerName);
}

function nextCharacter(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

function prevCharacter(c) {
  return String.fromCharCode(c.charCodeAt(0) - 1);
}
