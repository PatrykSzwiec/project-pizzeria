import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();

    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements() {
    const thisWidget = this;

    //thisWidget.dom.wrapper = element; -> BaseWidget will take care of this
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.Decrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.Increase = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    //console.log(thisWidget.dom.input.value);
  }

  isValid(value){
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    // Creating new customEvent
    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }

  /* CHANGING AMOUNT BASED ON  + or - widget at selecting product */
  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
      //console.log(thisWidget.dom.input.value);
    });

    // Listener that change amount on click minus
    thisWidget.dom.Decrease.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      thisWidget.setValue(thisWidget.value - 1);
    });

    // Listener that change amount on click plus
    thisWidget.dom.Increase.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;