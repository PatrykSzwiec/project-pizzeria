import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function(){
    const thisApp = this;

    // Find container with their all child elements
    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    // Find all navigation links
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    // open default page
    const idFromHash = window.location.hash.replace('#/', '');

    // if the page id is not corretct open page with below id
    let pageMatchingHash = thisApp.pages[0].id;

    // Take id of the page
    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    // activate page
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        // get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');
        // run thisApp.activatePage with that id
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    // add class "active" to matching pages, remove from non-matching
    for(let page of thisApp.pages){
      page.classList.toggle(
        classNames.pages.active,
        page.id == pageId
      );
    }
    // add class "active" to matching links, remove from non-matching
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

  },

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
      app.cart.add(event.detail.product.prepareCartProduct());
    });
  },

  initBooking: function(){
    const thisApp = this;

    const element = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(element);
  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
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