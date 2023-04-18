import {settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';
class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);
  }
  /* GETTING ALL THE DOM ELEMENTS TO EASLIER ACCESS TO OTHER METHODS */
  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.discount = thisCart.dom.wrapper.querySelector(
      select.cart.discount
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  /* EVENT LISTENERS FOR TOOGLE/REMOVE/AUTOUPDATE AND SUBMIT FUNCTION ALSO CART CLEAR */
  initActions() {
    const thisCart = this;
    // Event listener on click element thisCart.dom.toogleTrigger
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      // toogle active wrapper //
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
      thisCart.clearCart();
    });
  }
  /* SENDING ORDER BY POST TO app.json order{} WITH DATA AT payload VARIABLE */
  sendOrder() {
    const thisCart = this;
    // Connecting to app.json orders {} object
    const url = settings.db.url + '/' + settings.db.orders;

    // Creating const which sets parameteters which will be send as order
    const payload = {
      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalPrice: thisCart.dom.totalPrice,
      subtotalPrice: thisCart.dom.subtotalPrice,
      totalNumber: thisCart.dom.totalNumber,
      deliveryFee: thisCart.dom.deliveryFee,
      discount: thisCart.dom.discount,
      products: [],
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        thisCart.clearCart();
      });
  }
  /* ADDING PRODUCT TO CART */
  add(menuProduct) {
    const thisCart = this;

    // generate HTML based on template
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log(generatedHTML);

    // create DOM using utils.createElementFromHTML
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    // add DOM to product list at Cart
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
    //console.log('thisCart.products', thisCart.products);
    // console.log('adding product',menuProduct);
  }
  /* UPDATE CART ON EVERY CHANGE INSIDE */
  update() {
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;
    const discount = settings.discountValue.min; //NEW
    //console.log(deliveryFee);

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.totalPrice = 0;

    // LOOP to update totalNumber and subtotalPrice
    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    // Check if the totalNumber of products in Cart is 0 then deliveryFee is 0 and discount is 0
    if (thisCart.totalNumber > 0) {
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      //thisCart.dom.discount.innerHTML = discount; 
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee; //TO DO discount !!!
    } else {
      thisCart.dom.deliveryFee.innerHTML = 0; // reset delivery price to 0
      thisCart.dom.discount.innerHTML = 0; // reset discount to 0
    }

    // Accessing innerHTML of totalPrice  to each element at Cart
    for (let item of thisCart.dom.totalPrice) {
      item.innerHTML = thisCart.totalPrice;
    }
  }
  /* REMOVING SINGLE PRODUCT  DOM FROM CART */
  remove(cartProduct) {
    const thisCart = this;
    // Finding HTML element that represent product and remove it from the DOM
    cartProduct.dom.wrapper.remove();

    // Find the index of cartProduct object in 'products' array of the 'thisCart'
    const productIndex = thisCart.products.indexOf(cartProduct);

    // Removing object from 'products' using splice() method
    thisCart.products.splice(productIndex, 1);

    // Calling update methor to update cart after removing product
    thisCart.update();
  }
  /* CLEARING CART AFTER SUBMIT ORDER */
  clearCart() {
    const thisCart = this;
    const cartProducts = [...thisCart.products];

    // Removing all Products from Cart
    for (let cartProduct of cartProducts) {
      thisCart.remove(cartProduct);
    }

    // Remove data at inputs after order
    thisCart.dom.form.reset();

    thisCart.update();
  }
}

export default Cart;
