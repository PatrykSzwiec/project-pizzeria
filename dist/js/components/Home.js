import { select, templates } from '../settings.js';
import Carousel from './Carousel.js';


class Home {
  constructor(homeContainer){
    const thisHome = this;

    thisHome.render(homeContainer);
    thisHome.initWidgets();

  }

  render(homeContainer){
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = homeContainer;

    const generatedHTML = templates.homeWidget();
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.linkImage = thisHome.dom.wrapper.querySelectorAll(select.home.linkImage);

  }

  initWidgets(){
    const thisHome = this;

    thisHome.carousel = new Carousel(thisHome.dom.carouselWrapper);
  }

}

export default Home;