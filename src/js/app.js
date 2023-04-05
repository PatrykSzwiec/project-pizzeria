import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
const app = {
  initMenu: function(){
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }

    /* FUNCTION TO SORT PRODUCTS BY FAVOURITE RECENT CLICKED */
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

      //console.log('articles',articles, productList);

      // Reinsert sorted articles into product list
      articles.forEach((article) => {
        productList.appendChild(article);
      });
    }
    // Reinserting article based on timestamp
    const checkboxes = document.querySelectorAll('.favourite-checkbox');
    //console.log(checkboxes);
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('click', (event) => {
        const article = event.target.closest('article');
        article.dataset.lastClicked = Date.now(); // Store current timestamp
        sortProductList(); // Update sorting
      });
    });
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
        //console.log('parsedResponse', parsedResponse);

        /*save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
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


/*
const discounts = {
  'foo': {
    value: 15,
    count: 1,
    minValue: 20,
  },
  'bar': {
    value: 15,
    minValue: 20,
  },
  fooBar: {
    value: 15,
    count: 3,
  }
};

if (discounts.foo in 'count') {
  if (discounts.foo.count <= 0.) {
    throw new Error('Invalid'); //kod został użyty 
  }
}

order.placeOrder();

discounts.foo.count--;
*/