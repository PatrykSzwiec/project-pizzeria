import {select} from '../settings.js';

class Carousel {
  constructor(wrapper) {
    const  thisCarousel = this;

    thisCarousel.dom = {};

    thisCarousel.dom.wrapper = wrapper;
    thisCarousel.initPlugin();
  }

  initPlugin(){
    const thisCarousel = this;

    thisCarousel.dom.carousel = document.querySelector(select.home.carouselPlugin);
    //console.log(thisCarousel.dom.carousel);

    // eslint-disable-next-line no-unused-vars, no-undef
    const flkty = new Flickity( thisCarousel.dom.carousel, {
      cellAlign: 'left',
      contain: true,
      autoPlay: 3000,
      wrapAround: true
    });
  }
}

export default Carousel;
