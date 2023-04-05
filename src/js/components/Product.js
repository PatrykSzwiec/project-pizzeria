import { select, classNames, templates } from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

class Product {
  /* TAKE DATA FROM DATA.JS */
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('new Product:', thisProduct);
  }
  /* ADD PRODUCTS TO HTML AS DOM */
  renderInMenu() {
    const thisProduct = this;

    // Generate HTML based on template
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(generatedHTML);

    // Create element using utils.createELementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    // Find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);

    // Add element to menu
    menuContainer.appendChild(thisProduct.element);
  }
  /* LIST OF REFERENCES */
  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }
  /* ADDING ACTIVE CLASS TO CURRENT CHOOSED PRODUCT */
  initAccordion() {
    const thisProduct = this;

    // find the clickable trigger (the element that should react to clicking)

    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    // START: add event listener to clickable trigger on event click
    // clickableTrigger.addEventListener('click', function(event){   - first version if we using clickableTrigger variable
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      // prevent default action for event
      event.preventDefault();

      // find active product (product that has active class)

      const activeProduct = document.querySelector(
        select.all.menuProductsActive
      );

      // if there is active product and it's not thisProduct.element remove class active from it

      if (activeProduct && activeProduct != thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      // toogle active class on thisProduct.element

      thisProduct.element.classList.toggle(
        classNames.menuProduct.wrapperActive
      );
    });
  }
  /* SETTING UP EVENT LISTENERS FOR VARIOUS ELEMENTS */
  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.addToCart();
      thisProduct.processOrder();
    });
    //console.log('initOrderForm:', thisProduct);
  }

  processOrder() {
    const thisProduct = this;

    // covert form to object structure e.g. {sauce: ['tomato], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // LOOP for every category (param)....
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId= 'toppings', param = { label: 'Toppings', type: 'checkboxes'....}
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // LOOP for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log('optionId',optionId, option);
        // Create a const which contain param with a name of paramId in formData which includes optionId
        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);

        // check if there is param with a name of paramId in formData and if it includes optionId
        if (optionSelected) {
          // check if the option is not default
          if (!option.default) {
            // add option price to price variable
            price += option.price;
          }
        } else {
          // check if the option is default
          if (option.default) {
            // reduce price variable
            price -= option.price;
          }
        }
        // create a const to find image which answers a specific couple category-option
        const optionImage = thisProduct.imageWrapper.querySelector(
          '.' + paramId + '-' + optionId
        );
        // console.log('Image:', optionImage);
        if (optionImage) {
          if (optionSelected) {
            // add class active to image
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    // multiply price by amount
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    //console.log(price);
    thisProduct.priceElem.innerHTML = price;
    //console.log('processOrder:', thisProduct);
  }
  /* COUNTING HOW MANY PRODUCTS ARE IN CART */
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  /* ADDING PRODUCT TO CART */
  addToCart() {
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
  /* PREPARE PRODUCTS DATA FOR ADDING TO CART */
  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }
  /* PREPARE ALL PARAMS OF PRODUCT TO INSERT IT INTO prepareCartProduct */
  prepareCartProductParams() {
    const thisProduct = this;

    // covert form to object structure e.g. {sauce: ['tomato], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    // Create empty object which will contain params options
    const params = {};
    // LOOP for every category (param)....
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId= 'toppings', param = { label: 'Toppings', type: 'checkboxes'....}
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {},
      };

      // LOOP for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        // Create a const which contain param with a name of paramId in formData which includes optionId
        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);

        // check if there params[paramId] option[optionId] is selected
        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}

export default Product;
