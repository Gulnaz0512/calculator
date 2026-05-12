const display = document.querySelector('#display');
const valueButtons = document.querySelectorAll('[data-value]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const actionButtons = document.querySelectorAll('[data-action]');
const themeButtons = document.querySelectorAll('[data-theme]');

let firstNumber = null;
let operator = null;
let waitingForSecondNumber = false;
let currentValue = '0';

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error';

  const rounded = Number.parseFloat(value.toFixed(10));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function showDisplay() {
  if (currentValue === 'Error') {
    display.textContent = 'Error';
    return;
  }

  const [integerPart, decimalPart] = currentValue.split('.');
  const formattedInteger = Number(integerPart || '0').toLocaleString('en-US');
  display.textContent = decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

function inputNumber(value) {
  if (currentValue === 'Error') resetCalculator();

  if (waitingForSecondNumber) {
    currentValue = value === '.' ? '0.' : value;
    waitingForSecondNumber = false;
    showDisplay();
    return;
  }

  if (value === '.' && currentValue.includes('.')) return;
  if (value === '.') {
    currentValue += '.';
  } else {
    currentValue = currentValue === '0' ? value : currentValue + value;
  }

  showDisplay();
}

function calculate(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? NaN : a / b;
  return b;
}

function chooseOperator(nextOperator) {
  if (currentValue === 'Error') return;

  const inputValue = Number(currentValue);

  if (operator && waitingForSecondNumber) {
    operator = nextOperator;
    return;
  }

  if (firstNumber === null) {
    firstNumber = inputValue;
  } else if (operator) {
    const result = calculate(firstNumber, inputValue, operator);

    if (!Number.isFinite(result)) {
      currentValue = 'Error';
      firstNumber = null;
      operator = null;
      waitingForSecondNumber = true;
      showDisplay();
      return;
    }

    firstNumber = result;
    currentValue = String(Number.parseFloat(result.toFixed(10)));
    showDisplay();
  }

  operator = nextOperator;
  waitingForSecondNumber = true;
}

function resetCalculator() {
  firstNumber = null;
  operator = null;
  waitingForSecondNumber = false;
  currentValue = '0';
  showDisplay();
}

function deleteLastDigit() {
  if (currentValue === 'Error' || waitingForSecondNumber) {
    currentValue = '0';
    waitingForSecondNumber = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  }
  showDisplay();
}

function runAction(action) {
  if (action === 'reset') resetCalculator();
  if (action === 'delete') deleteLastDigit();
  if (action === 'calculate' && operator !== null && !waitingForSecondNumber) {
    const result = calculate(firstNumber, Number(currentValue), operator);

    if (!Number.isFinite(result)) {
      currentValue = 'Error';
    } else {
      currentValue = String(Number.parseFloat(result.toFixed(10)));
    }

    firstNumber = null;
    operator = null;
    waitingForSecondNumber = true;
    showDisplay();
  }
}

function setTheme(themeName) {
  document.documentElement.dataset.theme = themeName;
  localStorage.setItem('calculator-theme', themeName);

  themeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === themeName);
  });
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem('calculator-theme');
  if (savedTheme) return savedTheme;

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'theme-2' : 'theme-1';
}

valueButtons.forEach((button) => {
  button.addEventListener('click', () => inputNumber(button.dataset.value));
});

operatorButtons.forEach((button) => {
  button.addEventListener('click', () => chooseOperator(button.dataset.operator));
});

actionButtons.forEach((button) => {
  button.addEventListener('click', () => runAction(button.dataset.action));
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => setTheme(button.dataset.theme));
});

window.addEventListener('keydown', (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) inputNumber(key);
  if (['+', '-', '*', '/'].includes(key)) chooseOperator(key);
  if (key === 'Enter' || key === '=') runAction('calculate');
  if (key === 'Backspace') deleteLastDigit();
  if (key.toLowerCase() === 'c' || key === 'Escape') resetCalculator();
});

setTheme(getInitialTheme());
showDisplay();
