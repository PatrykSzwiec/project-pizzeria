import {settings, select} from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultMin);
    thisWidget.initActions();
    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    //console.log(thisWidget.input.value);
  }
  /* SETTING VALUE OF AMOUNT AND VALIDATION IF ITS NOT A INT */
  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: Add validation */
    if (
      thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax
    ) {
      thisWidget.value = newValue;
    }

    thisWidget.announce();

    thisWidget.input.value = thisWidget.value;
  }

  /* CHANGING AMOUNT BASED ON  + or - widget at selecting product */
  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
      console.log(thisWidget.input.value);
    });

    // Listener that change amount on click minus
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      thisWidget.setValue(thisWidget.value - 1);
    });

    // Listener that change amount on click plus
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce() {
    const thisWidget = this;

    // Creating new customEvent
    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;