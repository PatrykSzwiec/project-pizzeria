import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTables = null;
    thisBooking.starters = []; // initalize starters to an empty array

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      bookings:       settings.db.url + '/' + settings.db.bookings
                                           + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                           + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                           + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData url',urls);
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration ; hourBlock += 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      // thisBooking.booked - object , where we finding date with key "hour" and add table to this
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      //check is tableId is number
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        // is this table is available
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.ppl = thisBooking.dom.wrapper.querySelector(select.booking.ppl);
    thisBooking.dom.hours = thisBooking.dom.wrapper.querySelector(select.booking.hours);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector(select.booking.starters);
    thisBooking.dom.orderButton = thisBooking.dom.wrapper.querySelector(select.booking.orderButton);
  }

  initWidgets(){
    const thisBooking = this ;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      thisBooking.resetSelectedTables();

    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      thisBooking.resetSelectedTables();

    });

    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.resetSelectedTables();

    });

    thisBooking.dom.hourPicker.addEventListener('updated', function(){
      thisBooking.resetSelectedTables();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){

      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

    thisBooking.dom.starters.addEventListener('click', function(event){

      const clickedElement = event.target;

      const tagName = clickedElement.tagName;
      const type = clickedElement.getAttribute('type');
      const name = clickedElement.getAttribute('name');

      if(tagName == 'INPUT' && type == 'checkbox' && name == 'starter'){
        console.log('click');
        if(clickedElement.checked) {
          thisBooking.starters.push(clickedElement.value);
          console.log(clickedElement.value);
        } else {
          const starterNumber = thisBooking.starters.indexOf(clickedElement.value);
          thisBooking.starters.splice(starterNumber, 1);
        }
      }
      console.log(thisBooking.starters);
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
      for(let table of thisBooking.dom.tables){
        table.classList.remove(classNames.booking.tableSelected);
      }
      thisBooking.dom.form.reset();
    });
  }

  initTables(event){
    const thisBooking = this;

    const clickedElement = event.target;

    // Check that clickedElement contains class 'booked'
    if(clickedElement.classList.contains(classNames.booking.table)){
      // get Id of the table
      const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute);
      // check if there any tables already selected at selectedTables and contains 'selected' class
      if(thisBooking.selectedTables != 0 && clickedElement.classList.contains(classNames.booking.tableSelected)){
        clickedElement.classList.remove(classNames.booking.tableBooked);
        thisBooking.selectedTables = 0;
      }

      // if table is booked return alert
      else if (clickedElement.classList.contains(classNames.booking.tableBooked)){
        alert('This table is already booked');
      }

      // Check if the table is already selected
      else if (clickedElement.classList.contains(classNames.booking.tableSelected)){
        // If the table is already selected, remove the "selected" class
        clickedElement.classList.remove(classNames.booking.tableSelected);
      }

      else {
        for(let table of thisBooking.dom.tables){
          // If any table have class 'selected'
          if(table.classList.contains(classNames.booking.tableSelected)){
            // Remove this class from every table
            table.classList.remove(classNames.booking.tableSelected);
          }
        }
        // And add class 'selected' to clicked table
        clickedElement.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTable = tableId;
        console.log('thisBooking.selectedTable',thisBooking.selectedTable);
      }
    }

  }
  /* Method to reset selected table after update at date/hour/hours amount/people amount */
  resetSelectedTables() {
    // Select all tables with class 'selected'
    const selectedTables = document.querySelectorAll(select.booking.selected);
    selectedTables.forEach(table => {
      // Remove class 'selected' from every table'
      table.classList.remove(classNames.booking.tableSelected);
    });
  }

  sendBooking(){
    const thisBooking = this;

    // Connecting to app.json bookings {} object
    const url = settings.db.url + '/' + settings.db.bookings;

    // Creating const which sets parameteters which will be send as order
    const payload = {};
    payload.date     = thisBooking.date;
    payload.hour     = thisBooking.hourPicker.value;
    payload.table    = parseInt(thisBooking.selectedTable);
    payload.duration = parseInt(thisBooking.dom.hours.value);
    payload.ppl      = parseInt(thisBooking.dom.ppl.value);
    payload.phone    = thisBooking.dom.phone.value;
    payload.address  = thisBooking.dom.address.value;
    payload.starters = thisBooking.starters,

    // Update the 'thisBooking.booked' object with new booking information
    thisBooking.makeBooked(
      payload.date,
      payload.hour,
      payload.duration,
      payload.table
    );

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
        // Reload table to see all reservation even with new added
        thisBooking.getData();

        // Creating pop up message after sending booking order
        const popup = document.getElementById(select.booking.popup);
        popup.style.display = 'block';
        setTimeout(function(){
          popup.style.display = 'none';
        }, 3000);
      });

  }

}

export default Booking;