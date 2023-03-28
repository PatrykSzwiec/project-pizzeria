/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
        thisProduct.processOrder();
      });
      //console.log('initOrderForm:', thisProduct);
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
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
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
      //console.log('processOrder:', thisProduct);
    }

  }

  //
  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */

      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();

  // Function to play "Mamma Mia by Super Mario" by clicking at pizzeria title
  function playAudio(url) {
    new Audio(url).play();
  }
  playAudio();
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
