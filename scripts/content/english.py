"""English versions of the pages a visitor from abroad needs.

Localised rather than translated: written for someone who doesn't know the
area, so local shorthand is explained (Puncak, the one-way system, "all-in"),
local-only content is left out (wedding page, odd-even plates, blog), and
prices stay in rupiah. Lists that sit next to photos (destinations, routes)
follow the Indonesian order, because the photos are shared by position.
"""


def tt(title, text):
    return {"title": title, "text": text}


def q(question, answer):
    return {"question": question, "answer": answer}


def slug(s):
    return {"_type": "slug", "current": s}


SETTINGS = {
    "paymentTerms": "Once we send your invoice, you pay a 20% deposit into our official company account. The balance is paid to the driver when you meet, in cash or by bank transfer.",
    "rateNotes": {
        "city": "The in-town rate covers 12 hours with the car and driver in Greater Jakarta. Fuel, tolls, parking and the driver's meals (Rp100,000 a day) are paid separately. Rates for other cities are confirmed by our team.",
        "allIn": "The all-in rate is for 12 hours within Jakarta and includes fuel, tolls and the driver's meals; parking and entrance tickets are extra. Full-day hire (06:00 to 23:00), other cities and out-of-town trips are confirmed by our team. Extra hours cost 10% of the full-day rate per hour. Seat numbers include the driver.",
    },
    "trust": [
        tt("Experienced drivers", "Punctual, careful, and they know the roads they drive every day."),
        tt("Well-kept cars", "Every car is cleaned and checked before each pick-up."),
        tt("Clear prices", "Two simple options: 12 hours in town, or all-in. Confirmed in writing before you pay."),
        tt("24-hour support", "Our team answers on WhatsApp day and night."),
    ],
    "fraudWarning": {
        "title": "Beware of scams using the Arasya name",
        "text": "We only talk to customers from the official numbers below, and only accept payment into the account of PT Ayomi Raya Karsa. Please check both before you transfer any money.",
        "points": [
            "We never ask you to pay into a personal account.",
            "We never ask for OTP codes, PINs or passwords.",
            "Every booking comes with an official invoice from PT Ayomi Raya Karsa.",
            "Not sure a message is from us? Check with one of our official numbers first.",
        ],
    },
}

HOME = {
    "hero": {
        "eyebrow": "Car + driver · 24-hour WhatsApp",
        "title": "Car rental in Indonesia,",
        "titleAccent": "driver included",
        "lead": "From a seven-seater to a 14-seat van. Day hire, airport transfers, and trips to Puncak, Bandung and beyond.",
    },
    "seo": {
        "title": "Car Rental with Driver in Bogor, Jakarta & Bandung | Arasya",
        "description": "Rent a car with a professional driver: Avanza, Innova, Fortuner, Alphard or Hiace. 12-hour rates from Rp500,000 or all-in packages. Book on WhatsApp.",
    },
}

CITIES = {
    "city-bogor": {
        "slug": slug("car-rental-bogor"),
        "hero": {
            "eyebrow": "Bogor, West Java",
            "title": "Car rental in Bogor",
            "titleAccent": "with a driver",
            "lead": "A car and a local driver for business, sightseeing or family trips: around Bogor, up to the Puncak highlands, or further afield.",
        },
        "seo": {
            "title": "Car Rental in Bogor with Driver | Arasya Rent Car",
            "description": "Hire a car with a local driver in Bogor. Clear 12-hour or all-in rates, trips to Puncak, Jakarta airport and beyond. Book on WhatsApp.",
        },
        "pickupPoints": "Bogor station, the Puncak area, or your hotel",
        "areaServed": ["Bogor", "Puncak", "Cisarua", "Sentul", "Greater Jakarta"],
        "editorial": {
            "eyebrow": "About Bogor",
            "title": "The Rain City at the foot of Mount Salak",
            "lead": "About 60 km south of Jakarta, Bogor is a cool, green city known for its rain, its botanical gardens, and as the gateway to the Puncak tea-plantation highlands.",
            "body": [
                {"_type": "block", "_key": "enbg1", "style": "normal", "markDefs": [], "children": [{"_type": "span", "_key": "enbg1s", "marks": [], "text": "Driving here takes local knowledge. The road up to Puncak is steep and winding, and at weekends the police run it one way at a time (up in the morning, down in the afternoon), so timing is everything. It also rains most afternoons for much of the year."}]},
                {"_type": "block", "_key": "enbg2", "style": "normal", "markDefs": [], "children": [{"_type": "span", "_key": "enbg2s", "marks": [], "text": "Arasya drivers know the back roads, the hours to avoid and the easiest pick-up points around town, so you can get on with your day and leave the traffic to them."}]},
            ],
        },
        "destinations": [
            {"name": "Bogor Botanical Gardens", "area": "City centre", "text": "Founded in 1817, with thousands of tropical plant species and the Presidential Palace next door."},
            {"name": "Puncak highlands", "area": "Cisarua", "text": "Rolling tea plantations and cool mountain air. The winding climb is much more relaxing when someone else is driving."},
            {"name": "Taman Safari Indonesia", "area": "Cisarua", "text": "A drive-through wildlife park on the slopes of Mount Gede, easy to visit with a private car and driver."},
            {"name": "Jalan Suryakencana", "area": "City centre", "text": "Bogor's old Chinatown street and its best-known food stop: soto mie, asinan and more."},
            {"name": "Sentul", "area": "Babakan Madang", "text": "Hills, waterfalls and family attractions on the east side of Bogor, just off the Jagorawi toll road."},
            {"name": "Situ Gede", "area": "West Bogor", "text": "A quiet lake beside a research forest, perfect for a calm morning walk."},
        ],
        "routes": [
            {"to": "Jakarta", "duration": "1.5–2 hrs", "note": "Via the Jagorawi toll road. Soekarno-Hatta airport transfers available."},
            {"to": "Bandung", "duration": "about 3 hrs", "note": "By toll road via Cipularang, or over the Puncak pass through Cianjur."},
            {"to": "Puncak & Cipanas", "duration": "1–2 hrs", "note": "Timed around the weekend one-way system."},
            {"to": "Sukabumi & Pelabuhan Ratu", "duration": "2.5–3 hrs", "note": "South to the coast and the Ciletuh Geopark."},
        ],
        "faq": [
            q("Is the driver included in the price?", "Yes, always. You can choose 12 hours in town (fuel, tolls, parking and the driver's meals extra) or all-in (fuel, tolls and the driver's meals included)."),
            q("Can I rent a car without a driver?", "No. All our cars come with a driver who knows the area, which is the easiest and safest way to get around if you're new to Indonesian roads."),
            q("How do I book?", "Message us on WhatsApp with your dates, pick-up point and plans. We confirm the car, the price and the pick-up before anything is booked."),
            q("Can you pick me up from my hotel or villa in Puncak?", "Yes. Your driver can collect you anywhere in Bogor and the surrounding area, including hotels and villas in Puncak and Bogor station."),
            q("What happens if we need the car for more than 12 hours?", "Extra hours are charged at an hourly rate that we confirm in writing before your trip, so there are no surprises."),
            q("How do I pay?", "Once we send your invoice, you pay a 20% deposit into our official BCA account in the name of PT Ayomi Raya Karsa. The balance is paid to the driver when you meet, in cash or by transfer."),
        ],
    },
    "city-jakarta": {
        "slug": slug("car-rental-jakarta"),
        "hero": {
            "eyebrow": "Jakarta",
            "title": "Car rental in Jakarta",
            "titleAccent": "with a driver",
            "lead": "For meetings, airport transfers and family days out in Jakarta, and trips to Bogor, Puncak and Bandung.",
        },
        "seo": {
            "title": "Car Rental in Jakarta with Driver | Arasya Rent Car",
            "description": "Hire a car with a driver in Jakarta for meetings, airport transfers and day trips. 12-hour or all-in rates, trips to Bogor, Puncak and Bandung. Book on WhatsApp.",
        },
        "pickupPoints": "Soekarno-Hatta and Halim airports, Gambir station, or your hotel",
        "areaServed": ["Jakarta", "Soekarno-Hatta Airport", "Greater Jakarta"],
        "editorial": {
            "eyebrow": "About Jakarta",
            "title": "A city where the traffic sets the schedule",
            "lead": "Indonesia's capital and business hub is a sprawling city where the traffic often decides whether you make your next appointment.",
            "body": [
                {"_type": "block", "_key": "enjk1", "style": "normal", "markDefs": [], "children": [{"_type": "span", "_key": "enjk1s", "marks": [], "text": "Some main roads only allow cars with odd or even number plates at rush hour on weekdays, and the city and airport toll roads can clog in minutes. The same trip can take twice as long in the afternoon as it does in the morning."}]},
                {"_type": "block", "_key": "enjk2", "style": "normal", "markDefs": [], "children": [{"_type": "span", "_key": "enjk2s", "marks": [], "text": "Our drivers do the airport run, the business districts around Sudirman, Thamrin and Kuningan, and the toll roads to Bogor and Bandung every day. Send us your schedule and they will plan when to leave and which way to go."}]},
            ],
        },
        "destinations": [
            {"name": "National Monument (Monas)", "area": "Central Jakarta", "text": "The 132-metre tower in Merdeka Square, the city's landmark and a natural start to a Jakarta tour."},
            {"name": "Kota Tua (Old Batavia)", "area": "West Jakarta", "text": "The old Dutch colonial quarter, with the Fatahillah Museum and heritage buildings around the main square."},
            {"name": "Taman Mini Indonesia Indah", "area": "East Jakarta", "text": "A cultural park with traditional houses from every province, an easy full day out for families."},
            {"name": "Ancol Dreamland", "area": "North Jakarta", "text": "A seaside leisure complex with beaches, a theme park and family shows."},
        ],
        "routes": [
            {"to": "Soekarno-Hatta Airport", "duration": "1–1.5 hrs", "note": "Depends on traffic on the city and airport toll roads."},
            {"to": "Bogor", "duration": "1–1.5 hrs", "note": "Via the Jagorawi toll road."},
            {"to": "Puncak", "duration": "2–3 hrs", "note": "Timed around the weekend one-way system."},
            {"to": "Bandung", "duration": "about 3 hrs", "note": "Via the Cipularang toll road."},
        ],
        "faq": [
            q("Is the driver included in the price?", "Yes, always. You can choose 12 hours in town (fuel, tolls, parking and the driver's meals extra) or all-in (fuel, tolls and the driver's meals included)."),
            q("Can you meet me at Soekarno-Hatta Airport?", "Yes. Send your flight number when you book; the driver tracks your landing and waits in the arrivals area."),
            q("Do I need to worry about the odd-even plate rule?", "No. Tell us your plans when you book and your driver will choose the route and timing to fit the rule on the day."),
            q("How do I book?", "Message us on WhatsApp with your dates, pick-up point and plans. We confirm the car, the price and the pick-up before anything is booked."),
            q("How do I pay?", "Once we send your invoice, you pay a 20% deposit into our official BCA account in the name of PT Ayomi Raya Karsa. The balance is paid to the driver when you meet, in cash or by transfer."),
        ],
    },
    "city-bandung": {
        "slug": slug("car-rental-bandung"),
        "hero": {
            "eyebrow": "Bandung, West Java",
            "title": "Car rental in Bandung",
            "titleAccent": "with a driver",
            "lead": "For day trips to Lembang and Ciwidey, business in the city, and transfers to Jakarta and Bogor.",
        },
        "seo": {
            "title": "Car Rental in Bandung with Driver | Arasya Rent Car",
            "description": "Hire a car with a driver in Bandung for Lembang and Ciwidey day trips, business travel, and transfers to Jakarta or Bogor. Book on WhatsApp.",
        },
        "pickupPoints": "Bandung station, the Dago area, or your hotel",
        "areaServed": ["Bandung", "Lembang", "Ciwidey", "Greater Bandung"],
        "editorial": {
            "eyebrow": "About Bandung",
            "title": "A highland city with volcanoes on its doorstep",
            "lead": "Bandung sits in a cool highland basin about 150 km from Jakarta, ringed by volcanoes, tea estates and hot springs.",
            "body": [
                {"_type": "block", "_key": "enbd1", "style": "normal", "markDefs": [], "children": [{"_type": "span", "_key": "enbd1s", "marks": [], "text": "The best sights are outside the city: Lembang to the north and Ciwidey to the south. The roads climb and wind, and at weekends and during school holidays the queues into the tourist areas can be very long."}]},
                {"_type": "block", "_key": "enbd2", "style": "normal", "markDefs": [], "children": [{"_type": "span", "_key": "enbd2s", "marks": [], "text": "Your driver plans the day so you are not doubling back, leaves at the right time to beat the crowds, and knows where to park at the busy spots. All you have to do is enjoy the fresh air."}]},
            ],
        },
        "destinations": [
            {"name": "Tangkuban Perahu", "area": "Lembang", "text": "An active volcano whose crater you can walk right up to, the classic day trip north of Bandung."},
            {"name": "Kawah Putih", "area": "Ciwidey", "text": "A pale turquoise crater lake high in the hills, often misty and cold in the morning."},
            {"name": "Jalan Braga", "area": "City centre", "text": "Bandung's historic street of art deco buildings, cafés and galleries."},
            {"name": "Lembang", "area": "West Bandung", "text": "Family attractions, gardens and food stops along the road to Tangkuban Perahu."},
        ],
        "routes": [
            {"to": "Jakarta", "duration": "about 3 hrs", "note": "Via the Cipularang toll road."},
            {"to": "Bogor", "duration": "3–3.5 hrs", "note": "By toll road via Cipularang and Jagorawi, or through Cianjur and over Puncak."},
            {"to": "Soekarno-Hatta Airport", "duration": "about 3.5 hrs", "note": "Depends on traffic on the airport toll road."},
            {"to": "Garut", "duration": "2–3 hrs", "note": "Via Cileunyi and the Nagreg pass."},
        ],
        "faq": [
            q("Is the driver included in the price?", "Yes, always. You can choose 12 hours in town (fuel, tolls, parking and the driver's meals extra) or all-in (fuel, tolls and the driver's meals included)."),
            q("Can we do Lembang or Ciwidey in a day?", "Yes. The 12-hour hire is usually enough for either. Tell us which places you'd like to see and we'll confirm the price and suggest a start time."),
            q("How do I book?", "Message us on WhatsApp with your dates, pick-up point and plans. We confirm the car, the price and the pick-up before anything is booked."),
            q("Can you take us from Bandung to Jakarta airport?", "Yes. It takes about 3–4 hours; we'll suggest a pick-up time based on your flight."),
            q("How do I pay?", "Once we send your invoice, you pay a 20% deposit into our official BCA account in the name of PT Ayomi Raya Karsa. The balance is paid to the driver when you meet, in cash or by transfer."),
        ],
    },
}

SERVICES = {
    "service-travel": {
        "slug": slug("private-transfer"),
        "navLabel": "Transfers",
        "hero": {
            "eyebrow": "Private transfer · door to door",
            "title": "Private transfers between cities,",
            "titleAccent": "from your door",
            "lead": "One car and driver just for your group. No shared shuttle, no stops for strangers.",
        },
        "answerQuestion": "How much is a private transfer with Arasya?",
        "answer": "A private transfer is a car and driver for your group only, from your address to your destination. We run from Bogor, Jakarta and Bandung to Soekarno-Hatta Airport, Bandung, Garut, Serang and more, from Rp500,000 per car.",
        "highlights": [
            tt("Door to door", "Picked up at your address, dropped at your destination."),
            tt("Just your group", "Never shared with other passengers."),
            tt("Priced per car", "One price for the car, however many of you there are."),
        ],
        "faq": [
            q("Is the price per person?", "No. The price is for the whole car and your group."),
            q("Can you pick us up from our hotel?", "Yes. Every transfer is door to door, from your hotel, home or the airport."),
            q("Which routes do you cover?", "From Bogor, Jakarta and Bandung to Soekarno-Hatta Airport and between cities, including Bandung, Garut and Serang. Ask us on WhatsApp for any other route."),
        ],
        "origins": [{"name": "Bogor"}, {"name": "Jakarta"}, {"name": "Bandung"}],
        "units": [
            {"name": "Avanza · Xenia · Ertiga"},
            {"name": "Xpander · Rush"},
            {"name": "Innova Reborn"},
            {"name": "Innova Zenix"},
            {"name": "Innova Zenix Q Hybrid"},
        ],
        "seo": {
            "title": "Private Transfers: Jakarta Airport, Bogor, Bandung | Arasya",
            "description": "Door-to-door private car transfers from Bogor, Jakarta and Bandung to Soekarno-Hatta Airport and other cities. Priced per car, driver included.",
        },
    },
    "service-korporat": {
        "slug": slug("corporate"),
        "navLabel": "Corporate",
        "hero": {
            "eyebrow": "Company transport",
            "title": "Cars and drivers for your team",
            "titleAccent": "and your guests",
            "lead": "Airport pick-ups for visitors, out-of-town meetings and day-to-day office travel.",
        },
        "answerQuestion": "Does Arasya work with companies?",
        "answer": "Yes. Arasya Rent Car provides cars with drivers for companies in Bogor, Jakarta and Bandung, and is operated by PT Ayomi Raya Karsa. We have MPVs, SUVs and group vans, invoice in the company's name, and answer on WhatsApp 24 hours a day.",
        "highlights": [
            tt("A registered company", "Operated by PT Ayomi Raya Karsa. Payment only into the company account."),
            tt("24-hour support", "Last-minute changes and requests handled on WhatsApp."),
            tt("One car to a whole team", "From an MPV for a visitor to a Hiace for the department."),
            tt("Written quotes", "Rates and any extras confirmed in writing up front."),
        ],
        "steps": [
            tt("Send your requirements", "Dates, number of passengers, route and hours."),
            tt("Receive a quote", "We send car options and a written price."),
            tt("Invoice and schedule", "Invoice from PT Ayomi Raya Karsa; driver and times confirmed."),
        ],
        "faq": [
            q("Can you handle regular company transport?", "Yes. Send us your schedule and requirements and we'll prepare a written quote."),
            q("Which account do we pay into?", "Only our official account: BCA 095 484 0782 in the name of PT Ayomi Raya Karsa."),
            q("What if we need the car for more than 12 hours?", "Extra hours are charged at an hourly rate confirmed in writing before the trip."),
        ],
        "seo": {
            "title": "Corporate Car Rental with Driver in Indonesia | Arasya",
            "description": "Cars and drivers for companies in Bogor, Jakarta and Bandung: airport pick-ups, meetings and staff transport. Invoiced by PT Ayomi Raya Karsa.",
        },
    },
}
