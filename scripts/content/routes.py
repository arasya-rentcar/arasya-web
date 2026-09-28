"""Copy for the travel route pages (/travel/{slug}).

Driving times and distances are typical figures for a car on the toll
roads and change with traffic; the admin can correct them in the Studio
(Halaman layanan → Travel → Rute & tarif).
"""


def q(question, answer):
    return {"question": question, "answer": answer}


ROUTES = {
    ("bogor", "cgk"): {
        "slug": "bogor-bandara-soekarno-hatta",
        "distance": "±70 km",
        "duration": "1,5–2,5 jam",
        "via": "Tol Jagorawi, Tol Lingkar Luar Jakarta (JORR), lalu Tol Bandara Sedyatmo",
        "intro": "Antar-jemput Bandara Soekarno-Hatta adalah rute yang paling sering kami layani dari Bogor. Driver menjemput di rumah atau hotel Anda, membantu memasukkan koper, dan mengantar sampai depan terminal keberangkatan.\n\nWaktu tempuhnya sangat dipengaruhi jam berangkat. Di luar jam sibuk perjalanan bisa sekitar satu setengah jam, tetapi pada pagi hari kerja dan Jumat sore sebaiknya sediakan waktu lebih. Untuk penjemputan, driver memantau jadwal pendaratan Anda dan menunggu di area kedatangan.",
        "tips": [
            "Untuk penerbangan pagi, berangkat dari Bogor paling lambat 4 jam sebelum jadwal terbang.",
            "Sebutkan terminal (1, 2, atau 3) dan nomor penerbangan saat memesan supaya driver langsung menuju pintu yang tepat.",
            "Untuk penjemputan, kirim nomor penerbangan. Driver menyesuaikan bila pesawat terlambat.",
        ],
        "faq": [
            q("Berapa lama perjalanan Bogor ke Bandara Soekarno-Hatta?", "Biasanya 1,5–2,5 jam lewat tol, tergantung jam berangkat. Pada pagi hari kerja dan akhir pekan panjang, sediakan waktu lebih."),
            q("Apakah driver bisa menjemput di bandara saat saya mendarat?", "Bisa. Kirim nomor penerbangan saat memesan; driver memantau jadwal pendaratan dan menunggu di area kedatangan terminal Anda."),
        ],
        "en": {
            "destName": "Soekarno-Hatta Airport (CGK)",
            "duration": "1.5–2.5 hours",
            "distance": "about 70 km",
            "via": "Jagorawi toll road, the Jakarta outer ring road (JORR), then the Sedyatmo airport toll road",
            "intro": "Transfers between Bogor and Soekarno-Hatta, Jakarta's main international airport, are the trip we run most. Your driver collects you from your home or hotel, loads the bags and drops you right outside departures.\n\nHow long it takes depends mostly on when you leave. Outside rush hour it can be about ninety minutes, but on weekday mornings and Friday afternoons allow more. For arrivals, your driver tracks your flight and waits for you in the arrivals hall.",
            "tips": [
                "For a morning flight, leave Bogor at least four hours before departure.",
                "Tell us your terminal (1, 2 or 3) and flight number so the driver goes straight to the right door.",
                "For pick-ups, send your flight number. If the flight is late, the driver waits.",
            ],
            "faq": [
                q("How long is the drive from Bogor to Soekarno-Hatta Airport?", "Usually 1.5–2.5 hours on the toll roads, depending on the time of day. Allow extra on weekday mornings and holiday weekends."),
                q("Can the driver meet me when I land?", "Yes. Send your flight number when you book; the driver tracks the landing time and waits in the arrivals area of your terminal."),
            ],
        },
    },
    ("bogor", "bandung"): {
        "slug": "bogor-bandung",
        "distance": "±150 km lewat tol",
        "duration": "3–4 jam",
        "via": "Tol Jagorawi, Tol Jakarta–Cikampek, Tol Cipularang, lalu Tol Padaleunyi; alternatif lewat Puncak–Cianjur",
        "intro": "Bogor ke Bandung bisa ditempuh lewat dua jalur. Jalur tol lewat Cikampek dan Cipularang lebih panjang tetapi paling bisa diprediksi. Jalur Puncak–Cianjur lebih pendek dan pemandangannya indah, tetapi pada akhir pekan sering terkena sistem satu arah di Puncak.\n\nDriver kami memilih jalur sesuai hari dan jam berangkat Anda. Dengan travel carter, satu mobil hanya untuk rombongan Anda dan bisa berhenti di rest area atau tempat makan sesuai keinginan.",
        "tips": [
            "Hari kerja pagi biasanya paling lancar; Jumat sore dan Minggu sore paling padat.",
            "Pada akhir pekan, hindari jalur Puncak saat sistem satu arah diberlakukan.",
            "Rest area di Tol Cipularang cocok untuk istirahat sejenak di tengah perjalanan.",
        ],
        "faq": [
            q("Lewat tol atau lewat Puncak?", "Lewat tol lebih bisa diprediksi, terutama di akhir pekan. Lewat Puncak–Cianjur lebih pendek dan pemandangannya bagus di hari kerja. Driver kami menyarankan jalur terbaik sesuai jadwal Anda."),
            q("Apakah bisa mampir di perjalanan?", "Bisa. Satu mobil hanya untuk rombongan Anda, jadi berhenti untuk makan atau istirahat bisa diatur bersama driver."),
        ],
        "en": {
            "destName": "Bandung",
            "duration": "3–4 hours",
            "distance": "about 150 km by toll road",
            "via": "Jagorawi, Jakarta–Cikampek, Cipularang and Padaleunyi toll roads; or over the Puncak pass via Cianjur",
            "intro": "There are two ways from Bogor to Bandung. The toll road via Cikampek and Cipularang is longer but the most predictable. The road over the Puncak pass through Cianjur is shorter and far more scenic, but at weekends it is often closed in one direction for hours at a time.\n\nYour driver picks the route based on the day and time you travel. The car is yours alone, so you can stop for food or a break whenever you like.",
            "tips": [
                "Weekday mornings are usually the smoothest; Friday and Sunday afternoons are the busiest.",
                "At weekends, avoid the Puncak road while the one-way system is in force.",
                "The rest areas on the Cipularang toll road are a good halfway stop.",
            ],
            "faq": [
                q("Toll road or the Puncak pass?", "The toll road is more predictable, especially at weekends. The Puncak–Cianjur road is shorter and beautiful on a weekday. Your driver will suggest the best option for your timing."),
                q("Can we stop on the way?", "Yes. The car is only for your group, so stops for food or a rest are up to you and the driver."),
            ],
        },
    },
    ("bogor", "garut"): {
        "slug": "bogor-garut",
        "distance": "±210 km",
        "duration": "4,5–5,5 jam",
        "via": "Tol ke arah Bandung, keluar di Cileunyi, lalu jalur Nagreg ke Garut",
        "intro": "Garut dikenal dengan pemandian air panas di Cipanas, kawah Papandayan, dan dodolnya. Dari Bogor, perjalanan melewati tol sampai Bandung, lalu dilanjutkan jalur Nagreg yang menanjak dan berkelok.\n\nKarena perjalanannya cukup panjang, travel carter membuat rombongan bisa berangkat dari depan rumah, berhenti saat perlu, dan diantar langsung ke hotel atau alamat tujuan di Garut.",
        "tips": [
            "Berangkat pagi supaya tiba di Garut sebelum sore dan tidak melewati Nagreg saat gelap.",
            "Jalur Nagreg padat saat musim mudik dan libur panjang; sampaikan tanggal Anda agar admin menyarankan jam berangkat.",
        ],
        "faq": [
            q("Berapa lama perjalanan Bogor ke Garut?", "Sekitar 4,5–5,5 jam, tergantung kepadatan tol dan jalur Nagreg."),
            q("Apakah bisa diantar ke Cipanas atau Papandayan?", "Bisa. Sampaikan alamat hotel atau tujuan wisata di Garut, driver mengantar sampai lokasi."),
        ],
        "en": {
            "destName": "Garut",
            "duration": "4.5–5.5 hours",
            "distance": "about 210 km",
            "via": "Toll roads towards Bandung, exit at Cileunyi, then over the Nagreg pass",
            "intro": "Garut is known for the hot springs at Cipanas, the Papandayan crater and its dodol sweets. From Bogor you take the toll roads as far as Bandung, then a winding climb over the Nagreg pass.\n\nIt is a long day on the road, so a private car makes sense: you leave from your door, stop when you need to, and are dropped at your hotel in Garut.",
            "tips": [
                "Leave in the morning so you arrive before evening and cross Nagreg in daylight.",
                "Nagreg gets very busy around Eid and long holidays; tell us your date and we'll suggest a departure time.",
            ],
            "faq": [
                q("How long does Bogor to Garut take?", "About 4.5–5.5 hours, depending on toll-road traffic and the Nagreg pass."),
                q("Can you drop us at Cipanas or Papandayan?", "Yes. Send the address of your hotel or the place you want to visit and the driver takes you there."),
            ],
        },
    },
    ("jakarta", "bogor"): {
        "slug": "jakarta-bogor",
        "distance": "±55 km",
        "duration": "1–1,5 jam",
        "via": "Tol Jagorawi",
        "intro": "Jakarta ke Bogor adalah rute pendek lewat Tol Jagorawi, tetapi kepadatannya berubah drastis antara hari kerja dan akhir pekan. Banyak tamu kami memakai rute ini untuk menginap di Bogor, ke Kebun Raya, atau melanjutkan perjalanan ke Puncak.\n\nDengan travel carter, Anda dijemput di rumah, kantor, atau hotel di Jakarta dan diantar langsung ke alamat tujuan di Bogor tanpa ganti kendaraan.",
        "tips": [
            "Sabtu pagi arus ke Bogor dan Puncak ramai; berangkat sebelum pukul 7 bila memungkinkan.",
            "Bila akan lanjut ke Puncak, sampaikan saat memesan agar driver menyesuaikan dengan jadwal sistem satu arah.",
        ],
        "faq": [
            q("Berapa lama Jakarta ke Bogor?", "Sekitar 1–1,5 jam lewat Tol Jagorawi, lebih lama pada jam sibuk dan akhir pekan."),
            q("Apakah bisa lanjut ke Puncak?", "Bisa. Sampaikan tujuan akhirnya saat memesan, admin menghitungkan tarif sampai Puncak."),
        ],
        "en": {
            "destName": "Bogor",
            "duration": "1–1.5 hours",
            "distance": "about 55 km",
            "via": "Jagorawi toll road",
            "intro": "Jakarta to Bogor is a short run down the Jagorawi toll road, but traffic varies a lot between weekdays and weekends. Many of our guests use it to stay in Bogor, visit the Botanical Gardens or carry on up to Puncak.\n\nYou are collected from your home, office or hotel in Jakarta and taken straight to your address in Bogor, with no change of vehicle.",
            "tips": [
                "Saturday mornings are busy towards Bogor and Puncak; leave before 7 a.m. if you can.",
                "If you are carrying on to Puncak, tell us when you book so the driver can plan around the one-way system.",
            ],
            "faq": [
                q("How long is Jakarta to Bogor?", "About 1–1.5 hours on the Jagorawi toll road, longer at rush hour and weekends."),
                q("Can we continue to Puncak?", "Yes. Give us your final destination when you book and we'll quote the price to Puncak."),
            ],
        },
    },
    ("jakarta", "serang"): {
        "slug": "jakarta-serang",
        "distance": "±85 km",
        "duration": "1,5–2 jam",
        "via": "Tol Jakarta–Tangerang–Merak",
        "intro": "Serang adalah ibu kota Provinsi Banten dan pintu menuju kawasan Banten Lama, pantai Anyer, dan Pelabuhan Merak. Dari Jakarta, rutenya lurus lewat Tol Jakarta–Tangerang–Merak.\n\nRute ini sering dipakai untuk kunjungan kerja ke kawasan industri dan kantor pemerintahan di Serang, serta perjalanan keluarga ke pantai Anyer.",
        "tips": [
            "Bila tujuan akhir Anyer atau Carita, sampaikan saat memesan karena jaraknya lebih jauh dari Serang.",
            "Menjelang libur panjang, arus ke Pelabuhan Merak bisa padat; berangkat lebih awal.",
        ],
        "faq": [
            q("Berapa lama Jakarta ke Serang?", "Sekitar 1,5–2 jam lewat Tol Jakarta–Tangerang–Merak."),
            q("Apakah bisa diantar sampai Anyer?", "Bisa. Tarif ke Anyer atau Carita dihitung terpisah karena lebih jauh; tanyakan ke admin lewat WhatsApp."),
        ],
        "en": {
            "destName": "Serang",
            "duration": "1.5–2 hours",
            "distance": "about 85 km",
            "via": "Jakarta–Tangerang–Merak toll road",
            "intro": "Serang is the capital of Banten province and the gateway to the old sultanate sites of Banten Lama, the beaches at Anyer and the Merak ferry port. From Jakarta it is a straight run along the Jakarta–Tangerang–Merak toll road.\n\nThe route is popular for business visits to the industrial estates and government offices around Serang, and for family trips to the beach at Anyer.",
            "tips": [
                "If you are heading to Anyer or Carita, say so when you book: they are further than Serang.",
                "Before long holidays traffic towards Merak port builds up; leave early.",
            ],
            "faq": [
                q("How long is Jakarta to Serang?", "About 1.5–2 hours on the Jakarta–Tangerang–Merak toll road."),
                q("Can you take us on to Anyer?", "Yes. Anyer and Carita are priced separately because they are further; ask us on WhatsApp."),
            ],
        },
    },
    ("jakarta", "bandung"): {
        "slug": "jakarta-bandung",
        "distance": "±150 km",
        "duration": "3–3,5 jam",
        "via": "Tol Jakarta–Cikampek, Tol Cipularang, lalu Tol Padaleunyi",
        "intro": "Jakarta–Bandung adalah salah satu rute antar kota tersibuk di Jawa Barat. Perjalanan lewat Tol Cikampek dan Cipularang relatif lancar di hari kerja, tetapi pada Jumat sore arah Bandung dan Minggu sore arah Jakarta bisa jauh lebih lama.\n\nDengan travel carter, Anda tidak perlu ke pool atau stasiun: driver menjemput di alamat Anda di Jakarta dan mengantar langsung ke hotel, kantor, atau rumah di Bandung.",
        "tips": [
            "Hindari berangkat Jumat pukul 15.00–20.00 ke arah Bandung bila memungkinkan.",
            "Untuk perjalanan pulang-pergi di hari yang sama, sampaikan saat memesan agar admin menghitungkan tarif sewa harian.",
            "Rest area di Tol Cipularang cocok untuk istirahat di tengah perjalanan.",
        ],
        "faq": [
            q("Berapa lama perjalanan Jakarta ke Bandung?", "Sekitar 3–3,5 jam lewat tol, bisa lebih lama pada Jumat sore dan akhir pekan panjang."),
            q("Apakah bisa pulang-pergi di hari yang sama?", "Bisa. Untuk pulang-pergi, biasanya lebih tepat memakai sewa harian dengan driver; admin akan menghitungkan pilihan yang paling hemat."),
        ],
        "en": {
            "destName": "Bandung",
            "duration": "3–3.5 hours",
            "distance": "about 150 km",
            "via": "Jakarta–Cikampek, Cipularang and Padaleunyi toll roads",
            "intro": "Jakarta–Bandung is one of the busiest intercity routes in West Java. The toll road through Cikampek and Cipularang is fairly smooth on weekdays, but Friday afternoons towards Bandung and Sunday afternoons back to Jakarta can take a lot longer.\n\nThere is no need to get to a shuttle depot or the station: your driver collects you from your address in Jakarta and drops you at your hotel, office or home in Bandung.",
            "tips": [
                "If you can, avoid leaving for Bandung between 3 and 8 p.m. on a Friday.",
                "Going there and back in one day? Tell us when you book; a full-day hire is often the better deal.",
                "The rest areas on the Cipularang toll road make a good halfway stop.",
            ],
            "faq": [
                q("How long is the drive from Jakarta to Bandung?", "About 3–3.5 hours on the toll roads, longer on Friday afternoons and holiday weekends."),
                q("Can we go there and back in a day?", "Yes. For a return trip a full-day hire with a driver usually works out better; we'll quote whichever is cheaper."),
            ],
        },
    },
    ("jakarta", "garut"): {
        "slug": "jakarta-garut",
        "distance": "±230 km",
        "duration": "4,5–5,5 jam",
        "via": "Tol Cikampek dan Cipularang ke Bandung, keluar di Cileunyi, lalu jalur Nagreg",
        "intro": "Dari Jakarta, perjalanan ke Garut melewati tol sampai Bandung lalu jalur Nagreg. Rute ini banyak dipakai untuk pulang kampung, acara keluarga, dan wisata ke Cipanas atau Papandayan.\n\nPerjalanannya panjang, jadi kenyamanan mobil dan driver yang sudah mengenal jalur Nagreg sangat berpengaruh. Satu mobil hanya untuk rombongan Anda, berangkat dan berhenti sesuai kebutuhan.",
        "tips": [
            "Berangkat pagi supaya melewati Nagreg sebelum gelap.",
            "Saat musim mudik, sampaikan tanggal sejak jauh hari; unit cepat penuh.",
        ],
        "faq": [
            q("Berapa lama Jakarta ke Garut?", "Sekitar 4,5–5,5 jam, lebih lama saat libur panjang atau musim mudik."),
            q("Apakah bisa menjemput di beberapa alamat di Jakarta?", "Bisa, sampaikan semua alamat penjemputan saat memesan agar admin mengatur rute dan jam jemput."),
        ],
        "en": {
            "destName": "Garut",
            "duration": "4.5–5.5 hours",
            "distance": "about 230 km",
            "via": "Cikampek and Cipularang toll roads to Bandung, exit at Cileunyi, then the Nagreg pass",
            "intro": "From Jakarta, the way to Garut is the toll road to Bandung and then over the Nagreg pass. People take this route to visit family, for celebrations, and for the hot springs at Cipanas or the Papandayan crater.\n\nIt is a long drive, so a comfortable car and a driver who knows the Nagreg road make a real difference. The car is yours alone: leave and stop when it suits you.",
            "tips": [
                "Leave in the morning to cross Nagreg in daylight.",
                "Around Eid, book well ahead; cars go quickly.",
            ],
            "faq": [
                q("How long is Jakarta to Garut?", "About 4.5–5.5 hours, longer during holidays and around Eid."),
                q("Can you pick up from several addresses in Jakarta?", "Yes. Give us every pick-up address when you book and we'll plan the route and times."),
            ],
        },
    },
    ("bandung", "cgk"): {
        "slug": "bandung-bandara-soekarno-hatta",
        "distance": "±170 km",
        "duration": "3–4 jam",
        "via": "Tol Padaleunyi, Tol Cipularang, Tol Jakarta–Cikampek, lalu tol menuju bandara",
        "intro": "Bagi banyak warga Bandung, Bandara Soekarno-Hatta tetap menjadi pilihan utama karena pilihan rute dan jadwal penerbangannya paling banyak. Perjalanan lewat tol cukup panjang, jadi penjemputan tepat waktu dan driver yang tahu jam-jam padat sangat penting.\n\nDriver menjemput di rumah atau hotel Anda di Bandung dan mengantar sampai depan terminal. Untuk kedatangan, driver menunggu di bandara dan mengantar Anda langsung ke Bandung.",
        "tips": [
            "Untuk penerbangan internasional, berangkat dari Bandung paling lambat 6 jam sebelum jadwal terbang.",
            "Sebutkan terminal dan nomor penerbangan saat memesan.",
            "Hindari tiba di tol Jakarta pada jam pulang kantor bila memungkinkan.",
        ],
        "faq": [
            q("Berapa lama Bandung ke Bandara Soekarno-Hatta?", "Sekitar 3–4 jam lewat tol. Sediakan waktu lebih pada Jumat, Minggu sore, dan musim liburan."),
            q("Jam berapa sebaiknya berangkat dari Bandung?", "Untuk penerbangan domestik, sekitar 5 jam sebelum jadwal terbang; untuk internasional, sekitar 6 jam. Admin akan menyarankan jam jemput sesuai jadwal Anda."),
        ],
        "en": {
            "destName": "Soekarno-Hatta Airport (CGK)",
            "duration": "3–4 hours",
            "distance": "about 170 km",
            "via": "Padaleunyi, Cipularang and Jakarta–Cikampek toll roads, then the airport toll road",
            "intro": "For many travellers in Bandung, Soekarno-Hatta in Jakarta is still the airport of choice: it has by far the most flights and destinations. It is a long drive, so a punctual pick-up and a driver who knows when the roads jam matter.\n\nYour driver collects you from your home or hotel in Bandung and drops you outside your terminal. On arrival, the driver waits at the airport and takes you straight to Bandung.",
            "tips": [
                "For an international flight, leave Bandung at least six hours before departure.",
                "Tell us your terminal and flight number when you book.",
                "If you can, avoid reaching Jakarta's toll roads at evening rush hour.",
            ],
            "faq": [
                q("How long does Bandung to Soekarno-Hatta Airport take?", "About 3–4 hours on the toll roads. Allow more on Fridays, Sunday afternoons and during holidays."),
                q("When should I leave Bandung?", "About five hours before a domestic flight and six before an international one. We'll suggest a pick-up time for your flight."),
            ],
        },
    },
    ("bandung", "jakarta"): {
        "slug": "bandung-jakarta",
        "distance": "±150 km",
        "duration": "3–3,5 jam",
        "via": "Tol Padaleunyi, Tol Cipularang, lalu Tol Jakarta–Cikampek",
        "intro": "Bandung ke Jakarta adalah rute yang banyak dipakai untuk perjalanan dinas, pulang setelah liburan, dan antar keluarga. Minggu sore adalah waktu terpadat karena arus balik akhir pekan menuju Jakarta.\n\nDengan travel carter, Anda dijemput di alamat Anda di Bandung dan diantar langsung ke rumah, kantor, atau hotel di Jakarta tanpa transit.",
        "tips": [
            "Minggu sore arah Jakarta paling padat; berangkat pagi atau Senin subuh bila memungkinkan.",
            "Sampaikan alamat tujuan di Jakarta secara lengkap supaya driver bisa merencanakan keluar tol yang tepat.",
        ],
        "faq": [
            q("Berapa lama Bandung ke Jakarta?", "Sekitar 3–3,5 jam lewat tol, bisa lebih lama pada Minggu sore."),
            q("Apakah bisa diantar ke beberapa alamat di Jakarta?", "Bisa. Sampaikan semua alamat saat memesan; admin mengonfirmasi tarif bila ada tambahan titik antar."),
        ],
        "en": {
            "destName": "Jakarta",
            "duration": "3–3.5 hours",
            "distance": "about 150 km",
            "via": "Padaleunyi, Cipularang and Jakarta–Cikampek toll roads",
            "intro": "Bandung to Jakarta is a busy route for business trips, heading home after a holiday and taking family back. Sunday afternoon is the worst time, as weekend traffic pours back into Jakarta.\n\nYou are collected from your address in Bandung and taken straight to your home, office or hotel in Jakarta, with no transfers on the way.",
            "tips": [
                "Sunday afternoons towards Jakarta are the busiest; leave in the morning or early Monday if you can.",
                "Send your full Jakarta address so the driver can plan the right toll exit.",
            ],
            "faq": [
                q("How long is Bandung to Jakarta?", "About 3–3.5 hours on the toll roads, longer on Sunday afternoons."),
                q("Can you drop at more than one address in Jakarta?", "Yes. Give us every address when you book; we'll confirm the price if there are extra stops."),
            ],
        },
    },
    ("bandung", "bogor"): {
        "slug": "bandung-bogor",
        "distance": "±150 km lewat tol",
        "duration": "3–4 jam",
        "via": "Tol Padaleunyi, Tol Cipularang, Tol Jakarta–Cikampek, lalu Tol Jagorawi; alternatif lewat Cianjur–Puncak",
        "intro": "Dari Bandung ke Bogor ada dua pilihan: jalur tol lewat Cipularang dan Cikampek, atau jalur Cianjur–Puncak yang lebih pendek dan berpemandangan kebun teh. Pada akhir pekan, jalur Puncak sering diberlakukan sistem satu arah sehingga jalur tol biasanya lebih aman.\n\nDriver kami memilih jalur yang paling masuk akal untuk hari dan jam Anda, dan mengantar langsung sampai alamat tujuan di Bogor.",
        "tips": [
            "Lewat Puncak paling nyaman di hari kerja; di akhir pekan pilih jalur tol.",
            "Bila ingin mampir di Puncak atau Cianjur, sampaikan saat memesan.",
        ],
        "faq": [
            q("Lewat tol atau lewat Puncak?", "Di akhir pekan jalur tol biasanya lebih cepat karena sistem satu arah di Puncak. Di hari kerja, jalur Cianjur–Puncak bisa lebih singkat dan pemandangannya indah."),
            q("Berapa lama Bandung ke Bogor?", "Sekitar 3–4 jam, tergantung jalur dan kepadatan."),
        ],
        "en": {
            "destName": "Bogor",
            "duration": "3–4 hours",
            "distance": "about 150 km by toll road",
            "via": "Padaleunyi, Cipularang, Jakarta–Cikampek and Jagorawi toll roads; or via Cianjur over the Puncak pass",
            "intro": "From Bandung to Bogor you can take the toll roads via Cipularang and Cikampek, or the shorter road through Cianjur and over the Puncak pass, past tea plantations. At weekends the Puncak road often runs one way at a time, so the toll road is usually the safer bet.\n\nYour driver picks whichever makes most sense for your day and time, and takes you right to your address in Bogor.",
            "tips": [
                "The Puncak road is lovely on a weekday; at weekends take the toll road.",
                "If you'd like to stop in Puncak or Cianjur, tell us when you book.",
            ],
            "faq": [
                q("Toll road or the Puncak pass?", "At weekends the toll road is usually quicker because of the one-way system on Puncak. On weekdays the Cianjur–Puncak road can be shorter, and the views are beautiful."),
                q("How long is Bandung to Bogor?", "About 3–4 hours, depending on the route and traffic."),
            ],
        },
    },
}
