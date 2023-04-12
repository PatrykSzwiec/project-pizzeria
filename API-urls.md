# Rezerwacje z zakresu dat

    http://localhost:3131
    /
    bookings
    ?
    date_gte=2023-01-01
    &
    date_lte=2023-12-31

# Wydarzenia jednorazowe z zakresu dat

    http://localhost:3131/events?repeat=false&date_gte=2023-01-01&date_lte=2023-12-31

# Wydarzenia codzienne, których rozpoczęcie jest przed datą

    http://localhost:3131/event?repeat_ne=false&date_lte=2023-12-31