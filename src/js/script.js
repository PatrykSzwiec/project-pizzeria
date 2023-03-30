/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },

  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    /* TAKE DATA FROM DATA.JS */
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      //console.log(id);
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
    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);
      /* create element using utils.createELementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }
    /* LIST OF REFERENCES */
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    /* ADDING ACTIVE CLASS TO CURRENT CHOOSED PRODUCT */
    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */

      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      //clickableTrigger.addEventListener('click', function(event){   - first version if we using clickableTrigger variable
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */

        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element remove class active from it */

        if(activeProduct && activeProduct != thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toogle active class on thisProduct.element */

        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.addToCart();
        thisProduct.processOrder();
      });
      //console.log('initOrderForm:', thisProduct);
    }

    processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. {sauce: ['tomato], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // LOOP for every category (param)....
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId= 'toppings', param = { label: 'Toppings', type: 'checkboxes'....}
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // LOOP for every option in this category
        for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // console.log('optionId',optionId, option);
          // Create a const which contain param with a name of paramId in formData which includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          // check if there is param with a name of paramId in formData and if it includes optionId
          if(optionSelected) {
          // check if the option is not default
            if(!option.default) {
            // add option price to price variable
              price += option.price;
            }
          }

          else {
          // check if the option is default
            if(option.default) {
            // reduce price variable
              price -= option.price;
            }
          }
          // create a const to find image which answers a specific couple category-option
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          // console.log('Image:', optionImage);
          if(optionImage){
            if(optionSelected) {
              // add class active to image
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }

      }
      thisProduct.priceSingle = price;
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      //console.log(price);
      thisProduct.priceElem.innerHTML = price;
      //console.log('processOrder:', thisProduct);
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id ,
        name: thisProduct.data.name ,
        amount:  thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      // covert form to object structure e.g. {sauce: ['tomato], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // Create empty object which will contain params options
      const params = {};
      // LOOP for every category (param)....
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId= 'toppings', param = { label: 'Toppings', type: 'checkboxes'....}
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };

        // LOOP for every option in this category
        for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          // Create a const which contain param with a name of paramId in formData which includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          // check if there params[paramId] option[optionId] is selected
          if(optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
      //console.log(thisWidget.value);
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        /* prevent default action for event */
        event.preventDefault();

        thisWidget.setValue(thisWidget.value - 1);

      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        /* prevent default action for event */
        event.preventDefault();

        thisWidget.setValue(thisWidget.value + 1);

      });
    }
  }

  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    }

    initActions(){
      const thisCart = this;
      // Event listener on click element thisCart.dom.toogleTrigger
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        /* toogle active wrapper */
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address,
        phone: thisCart.dom.phone,
        totalPrice: thisCart.dom.totalPrice,
        subtotalPrice: thisCart.dom.subtotalPrice,
        totalNumber: thisCart.dom.totalNumber,
        deliveryFee: thisCart.dom.deliveryFee,
        products: []
      };

      for(let prod of thisCart.products) {
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
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
    }

    add(menuProduct){
      const thisCart = this;

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      //console.log(generatedHTML);

      /* create DOM using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* add DOM to product list at Cart */
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
      //console.log('thisCart.products', thisCart.products);
      // console.log('adding product',menuProduct);
    }

    update(){
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      //console.log(deliveryFee);

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.totalPrice = 0;

      // LOOP to update totalNumber and subtotalPrice
      for(let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
      /* If cart is empty set deliveryFee value to 0 */
      if(thisCart.subtotalPrice != 0){
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
      } else{
        thisCart.totalPrice = 0;
        thisCart.dom.deliveryFee.innerHTML = 0;
      }

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;

      /* Accessing innerHTML to each element at Cart */
      for (let item of thisCart.dom.totalPrice){
        item.innerHTML = thisCart.totalPrice;
      }

    }

    remove(cartProduct){
      const thisCart = this;
      /* Finding HTML element that represent product and remove it from the DOM*/
      cartProduct.dom.wrapper.remove();
      /* Find the index of cartProduct object in 'products' array of the 'thisCart' */
      const productIndex = thisCart.products.indexOf(cartProduct);
      /* Removing object from 'products' using splice() method */
      thisCart.products.splice(productIndex);
      /* Calling update methor to update cart after removing product */
      thisCart.update();
    }
  }

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      //console.log(thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

      //console.log('thisCartProduct', thisCartProduct);
    }

    getData(){
      const thisCartProduct = this;

      const productCartSummary = {
        id: thisCartProduct.id ,
        name: thisCartProduct.name ,
        amount:  thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        params: thisCartProduct.params,
      };
      return productCartSummary;

    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      //console.log(thisCartProduct.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        // Take amount value from AmountWidget object
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        // Calculate amount * price Single
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        // Update the price at HTML
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }
  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }

    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })

        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /*save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();

  // Function to sort products by recent clicked to favourite
  function sortProductList() {
    // Create const which contain <div class='product-list'>
    const productList = document.querySelector('.product-list');
    // Make array from all articles
    const articles = Array.from(productList.querySelectorAll('article'));
  
    // Sort articles by checkbox checked state and click timestamp
    articles.sort((a, b) => {
      const checkboxA = a.querySelector('.favourite-checkbox');
      const checkboxB = b.querySelector('.favourite-checkbox');
      const checkedA = checkboxA ? checkboxA.checked : false;
      const checkedB = checkboxB ? checkboxB.checked : false;
      const timestampA = parseInt(a.dataset.lastClicked) || 0;
      const timestampB = parseInt(b.dataset.lastClicked) || 0;
  
      if (checkedA === checkedB) {
        return timestampB - timestampA; // Sort by most recent click
      } else if (checkedA) {
        return -1; // Checkbox A checked, move it up
      } else {
        return 1; // Checkbox B checked, move it up
      }
    });
  
    // Reinsert sorted articles into product list
    articles.forEach((article) => {
      productList.appendChild(article);
    });
  }
  // Reinserting article based on timestamp
  const checkboxes = document.querySelectorAll('.favourite-checkbox');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', (event) => {
      const article = event.target.closest('article');
      article.dataset.lastClicked = Date.now(); // Store current timestamp
      sortProductList(); // Update sorting
    });
  });
}
