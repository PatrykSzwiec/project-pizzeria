import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    console.log(thisCartProduct.amount);
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    //console.log(thisCartProduct);
  }
  /* GETTING ALL THE DOM ELEMENTS TO EASLIER ACCESS TO OTHER METHODS */
  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget =
      thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.amountWidget
      );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );

    //console.log('thisCartProduct', thisCartProduct);
  }
  /* GETTING ALL NECESSARY DATA FROM PRODUCT TO DISPLAY */

  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      // Take amount value from AmountWidget object
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      //console.log(thisCartProduct.amount.value);
      // Calculate amount * price Single
      thisCartProduct.price =
        thisCartProduct.amount * thisCartProduct.priceSingle;
      // Update the price at HTML
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  getData() {
    const thisCartProduct = this;

    const productCartSummary = {
      id: thisCartProduct.id,
      name: thisCartProduct.name,
      amount: thisCartProduct.amount,
      priceSingle: thisCartProduct.priceSingle,
      price: thisCartProduct.price,
      params: thisCartProduct.params,
    };
    return productCartSummary;
  }

  /* REMOVING SINGLE PRODUCT FROM CART */
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  /* INIT ACTIONS ON ICON CLICK EDIT/DELETE */
  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
}

export default CartProduct;