"""Copy for the per-unit pages (/armada/{slug}) and their English versions.

Model facts are kept to what holds for every unit of that model (seat
layout, body type, what it is good at). Numbers that vary per unit (engine,
transmission, year) are left to the admin, and capacity comes from the car
document itself.
"""


def tt(title, text):
    return {"title": title, "text": text}


def q(question, answer):
    return {"question": question, "answer": answer}


CARS = {
    "car-toyota-avanza": {
        "travelUnit": "avanza",
        "description": "MPV tujuh kursi paling umum di Indonesia, hemat dan mudah dicari suku cadangnya.",
        "summary": "Toyota Avanza adalah pilihan paling hemat untuk keluarga kecil atau rombongan kerja sampai enam penumpang. Kabinnya tiga baris, cukup lega untuk perjalanan dalam kota dan ke luar kota jarak menengah, dan tarifnya paling rendah di armada kami.",
        "idealFor": [
            "Perjalanan keluarga dalam kota atau ke Puncak",
            "Antar-jemput bandara dengan bawaan secukupnya",
            "Perjalanan dinas hemat untuk 3–4 orang",
            "Sewa harian dengan anggaran terbatas",
        ],
        "features": [
            tt("Tarif paling hemat", "Unit dengan tarif 12 jam terendah di armada Arasya."),
            tt("Tiga baris kursi", "Baris ketiga bisa dilipat saat bawaan lebih banyak dari penumpang."),
            tt("Lincah di jalan kota", "Ukurannya ringkas, mudah bermanuver di jalan sempit dan parkir padat."),
        ],
        "luggage": "Dengan tiga baris terisi, muat 2–3 tas kabin. Lipat baris ketiga untuk 2 koper besar.",
        "faq": [
            q("Berapa orang yang nyaman di Avanza?", "Nyaman untuk 4–5 penumpang dewasa dengan bawaan. Enam penumpang bisa, tetapi baris ketiga lebih cocok untuk anak-anak atau perjalanan pendek."),
            q("Avanza atau Xpander, mana yang lebih cocok?", "Avanza lebih hemat. Xpander sedikit lebih lega dan suspensinya lebih empuk, jadi lebih nyaman untuk perjalanan luar kota yang panjang."),
        ],
        "en": {
            "description": "Indonesia's everyday seven-seater: economical and easy to get around in.",
            "summary": "The Toyota Avanza is our most affordable car, a three-row seven-seater that suits small families or work trips for up to six passengers. It is comfortable around town and on medium-distance trips, and costs the least of anything in our fleet.",
            "idealFor": [
                "Family days out in town or up to Puncak",
                "Airport runs with a normal amount of luggage",
                "Budget business trips for 3–4 people",
                "Full-day hire on a tight budget",
            ],
            "features": [
                tt("Best value", "The lowest 12-hour rate in the Arasya fleet."),
                tt("Three rows", "The third row folds down when you have more bags than people."),
                tt("Easy in traffic", "Compact enough for narrow streets and crowded car parks."),
            ],
            "luggage": "2–3 cabin bags with all seats in use; 2 large suitcases with the third row folded.",
            "faq": [
                q("How many people fit comfortably in an Avanza?", "Four or five adults with luggage travel comfortably. Six is possible, but the third row is best for children or short trips."),
                q("Avanza or Xpander?", "The Avanza is cheaper. The Xpander has a little more room and a softer ride, which makes a difference on long out-of-town drives."),
            ],
        },
    },
    "car-suzuki-ertiga": {
        "travelUnit": "avanza",
        "description": "MPV tujuh kursi yang irit dengan kabin rapi dan senyap untuk kelasnya.",
        "summary": "Suzuki Ertiga sekelas dengan Avanza dan dengan tarif yang sama. Kabinnya rapi dan cukup senyap untuk kelasnya, cocok untuk keluarga atau rekan kerja yang bepergian di dalam kota dan ke kota tetangga.",
        "idealFor": [
            "Keluarga kecil yang berwisata dalam kota",
            "Perjalanan dinas ke Jakarta atau Bandung",
            "Antar-jemput stasiun dan bandara",
        ],
        "features": [
            tt("Sekelas Avanza", "Tarif sama dengan Avanza, jadi bisa jadi alternatif saat Avanza penuh."),
            tt("Kabin rapi", "Kabin yang tertata dan kursi yang nyaman untuk perjalanan beberapa jam."),
        ],
        "luggage": "Dengan tiga baris terisi, muat 2 tas kabin. Lipat baris ketiga untuk 2 koper besar.",
        "faq": [
            q("Apakah Ertiga bisa untuk ke Puncak?", "Bisa. Untuk rute menanjak dengan penumpang penuh, driver kami mengatur kecepatan dan waktu berangkat supaya perjalanan tetap nyaman."),
            q("Bisa pilih Ertiga secara khusus?", "Bisa, sebutkan saat memesan. Bila Ertiga sedang dipakai, admin menawarkan Avanza dengan tarif yang sama."),
        ],
        "en": {
            "description": "An economical seven-seater with a neat, quiet cabin for its class.",
            "summary": "The Suzuki Ertiga sits in the same class and price as the Avanza. Its cabin is tidy and fairly quiet, which makes it a good fit for families or colleagues travelling around town or to a neighbouring city.",
            "idealFor": [
                "Small families sightseeing in town",
                "Business trips to Jakarta or Bandung",
                "Station and airport transfers",
            ],
            "features": [
                tt("Same class as the Avanza", "Same rate as the Avanza, so it is a good alternative when the Avanza is booked."),
                tt("Neat cabin", "Well laid out, with seats that stay comfortable for a few hours on the road."),
            ],
            "luggage": "2 cabin bags with all seats in use; 2 large suitcases with the third row folded.",
            "faq": [
                q("Can the Ertiga handle the drive to Puncak?", "Yes. On the climb with a full car, our driver sets the pace and the departure time so the trip stays comfortable."),
                q("Can I ask for the Ertiga specifically?", "Yes, mention it when you book. If it is out, we offer an Avanza at the same rate."),
            ],
        },
    },
    "car-mitsubishi-xpander": {
        "travelUnit": "xpander",
        "description": "MPV tujuh kursi yang lebih lega dengan suspensi empuk dan posisi duduk tinggi.",
        "summary": "Mitsubishi Xpander memberi ruang dan kenyamanan sedikit di atas Avanza dengan selisih tarif yang kecil. Posisi duduknya tinggi dan suspensinya empuk, jadi terasa lebih nyaman untuk perjalanan luar kota beberapa jam.",
        "idealFor": [
            "Perjalanan keluarga ke luar kota",
            "Wisata ke Puncak, Lembang, atau Ciwidey",
            "Antar-jemput bandara dengan bawaan lebih banyak",
            "Rombongan kerja 4–6 orang",
        ],
        "features": [
            tt("Suspensi empuk", "Guncangan jalan terasa lebih halus, terutama untuk penumpang baris kedua."),
            tt("Jarak ke tanah tinggi", "Lebih tenang melewati jalan rusak atau genangan saat musim hujan."),
            tt("Kabin lega", "Ruang kaki dan kepala lebih lapang dibanding MPV sekelasnya."),
        ],
        "luggage": "Dengan tiga baris terisi, muat 2–3 tas kabin. Lipat baris ketiga untuk 2–3 koper besar.",
        "faq": [
            q("Kenapa memilih Xpander dibanding Avanza?", "Untuk perjalanan lebih dari dua jam, Xpander terasa lebih nyaman karena kabinnya lebih lega dan suspensinya lebih empuk. Selisih tarifnya kecil."),
            q("Apakah Xpander cocok untuk enam penumpang?", "Cocok, terutama bila penumpang baris ketiga anak-anak atau remaja. Untuk enam orang dewasa dengan koper, pertimbangkan Innova Reborn."),
        ],
        "en": {
            "description": "A roomier seven-seater with a soft ride and a high seating position.",
            "summary": "The Mitsubishi Xpander gives you a little more space and comfort than the Avanza for only slightly more money. You sit higher, the suspension is softer, and it is noticeably more relaxing on drives of a few hours.",
            "idealFor": [
                "Family trips out of town",
                "Day trips to Puncak, Lembang or Ciwidey",
                "Airport runs with extra luggage",
                "Work groups of 4–6",
            ],
            "features": [
                tt("Soft ride", "Bumps feel gentler, especially from the middle row."),
                tt("High ground clearance", "Handles broken roads and rainy-season puddles with less fuss."),
                tt("Roomy cabin", "More leg and head room than other seven-seaters in its class."),
            ],
            "luggage": "2–3 cabin bags with all seats in use; 2–3 large suitcases with the third row folded.",
            "faq": [
                q("Why pick the Xpander over the Avanza?", "On anything over two hours it is simply more comfortable: more room and a softer ride, for a small difference in price."),
                q("Does the Xpander work for six passengers?", "Yes, especially if the third row is for children or teenagers. For six adults with suitcases, the Innova Reborn is a better fit."),
            ],
        },
    },
    "car-daihatsu-terios": {
        "travelUnit": "xpander",
        "description": "SUV kompak tujuh kursi dengan jarak ke tanah tinggi untuk jalan menanjak.",
        "summary": "Daihatsu Terios adalah SUV kompak dengan jarak ke tanah tinggi, cocok untuk jalan menanjak, jalan desa, dan destinasi wisata alam. Ukurannya ringkas sehingga tetap lincah di jalan sempit kawasan wisata.",
        "idealFor": [
            "Wisata alam dengan jalan menanjak atau kurang mulus",
            "Perjalanan ke vila di kawasan Puncak",
            "Rombongan 3–4 orang yang ingin mobil lebih tinggi",
        ],
        "features": [
            tt("Jarak ke tanah tinggi", "Lebih aman melewati polisi tidur tinggi, jalan berbatu, dan genangan."),
            tt("Ringkas dan lincah", "Mudah diparkir dan berputar di jalan sempit menuju vila atau tempat wisata."),
        ],
        "luggage": "Bagasi kecil saat baris ketiga terisi. Untuk 4 penumpang, baris ketiga dilipat dan muat 2 koper.",
        "faq": [
            q("Terios atau Xpander?", "Terios lebih tinggi dan lebih cocok untuk jalan kurang mulus. Xpander lebih lega dan empuk untuk jalan tol dan perjalanan panjang."),
            q("Apakah Terios cocok untuk enam penumpang?", "Baris ketiganya sempit, jadi paling nyaman untuk 4 penumpang dewasa. Untuk rombongan lebih besar, pilih Innova atau Hiace."),
        ],
        "en": {
            "description": "A compact seven-seat SUV with the ground clearance for hill roads.",
            "summary": "The Daihatsu Terios is a compact SUV that sits high off the ground, so it copes well with steep hills, village roads and rougher tracks to nature spots. It is small enough to stay nimble on narrow lanes near villas and viewpoints.",
            "idealFor": [
                "Nature trips on steep or uneven roads",
                "Getting to villas around Puncak",
                "Groups of 3–4 who prefer a higher car",
            ],
            "features": [
                tt("High ground clearance", "Handles tall speed bumps, rocky tracks and flooded patches with ease."),
                tt("Compact", "Easy to park and turn on the narrow roads up to villas and attractions."),
            ],
            "luggage": "Little boot space with the third row up. For 4 passengers, fold it down to fit 2 suitcases.",
            "faq": [
                q("Terios or Xpander?", "The Terios sits higher and suits rougher roads. The Xpander is roomier and smoother on toll roads and long drives."),
                q("Is the Terios good for six people?", "Its third row is tight, so it is best for four adults. For bigger groups, choose an Innova or a Hiace."),
            ],
        },
    },
    "car-toyota-rush": {
        "travelUnit": "xpander",
        "description": "SUV kompak tujuh kursi, kembaran Terios, tangguh untuk jalan menanjak.",
        "summary": "Toyota Rush adalah SUV kompak tujuh kursi yang tangguh untuk jalan menanjak dan jalan kurang mulus. Pilihan tepat bila tujuan Anda vila, perkebunan, atau wisata alam di luar jalur utama.",
        "idealFor": [
            "Perjalanan ke vila dan perkebunan",
            "Wisata alam di kawasan pegunungan",
            "Rombongan 3–4 orang dengan bawaan sedang",
        ],
        "features": [
            tt("Posisi duduk tinggi", "Pandangan ke depan lebih luas, nyaman di jalan berkelok."),
            tt("Tangguh di tanjakan", "Cocok untuk jalan menanjak dan jalan desa menuju tempat wisata."),
        ],
        "luggage": "Bagasi kecil saat baris ketiga terisi. Untuk 4 penumpang, lipat baris ketiga untuk 2 koper.",
        "faq": [
            q("Apa bedanya Rush dan Terios?", "Keduanya kembar dengan ukuran dan kemampuan yang serupa. Tarifnya sama; pilih yang tersedia di tanggal Anda."),
            q("Apakah Rush cocok untuk antar-jemput bandara?", "Cocok untuk 3–4 penumpang dengan bawaan sedang. Untuk koper banyak, Xpander atau Innova lebih lega."),
        ],
        "en": {
            "description": "A tough compact seven-seat SUV, twin of the Terios.",
            "summary": "The Toyota Rush is a compact seven-seat SUV built for hills and rough roads. It is the one to pick when you are heading to a villa, a plantation or a nature spot off the main roads.",
            "idealFor": [
                "Villas and plantations",
                "Mountain sightseeing",
                "Groups of 3–4 with moderate luggage",
            ],
            "features": [
                tt("High seating position", "A clear view ahead, which helps on winding roads."),
                tt("Good on climbs", "Suited to steep and village roads leading to attractions."),
            ],
            "luggage": "Little boot space with the third row up. For 4 passengers, fold it to fit 2 suitcases.",
            "faq": [
                q("What's the difference between the Rush and the Terios?", "They are twins, similar in size and ability, and cost the same. Take whichever is free on your dates."),
                q("Is the Rush fine for an airport run?", "For 3–4 passengers with moderate luggage, yes. With a lot of suitcases, an Xpander or Innova has more room."),
            ],
        },
    },
    "car-toyota-innova-reborn": {
        "travelUnit": "reborn",
        "description": "MPV andalan untuk perjalanan jauh: kabin lega, kuat di tanjakan, nyaman untuk enam penumpang.",
        "summary": "Toyota Innova Reborn adalah mobil yang paling sering kami rekomendasikan untuk perjalanan luar kota. Kabinnya lega untuk enam penumpang dewasa, bagasinya cukup untuk koper, dan mobil ini nyaman di jalan tol maupun tanjakan Puncak.",
        "idealFor": [
            "Perjalanan luar kota 3 jam atau lebih",
            "Keluarga besar dengan koper",
            "Tamu bisnis dan perjalanan dinas",
            "Antar-jemput bandara rombongan",
        ],
        "features": [
            tt("Lega untuk enam dewasa", "Baris kedua dan ketiga tetap nyaman untuk orang dewasa di perjalanan panjang."),
            tt("Nyaman di tanjakan", "Stabil dan bertenaga di rute menanjak seperti Puncak dan Lembang."),
            tt("Pilihan favorit korporat", "Sering dipakai untuk tamu perusahaan karena nyaman dan tampil rapi."),
        ],
        "luggage": "Dengan enam penumpang, muat 2–3 koper sedang. Dengan baris ketiga dilipat, muat 4 koper besar.",
        "faq": [
            q("Kenapa Innova Reborn sering direkomendasikan?", "Karena seimbang: kabin lega, nyaman untuk perjalanan jauh, dan tarifnya masih di bawah kelas premium seperti Zenix."),
            q("Innova Reborn atau Zenix?", "Reborn sudah nyaman untuk kebanyakan perjalanan. Zenix lebih baru, kabinnya lebih senyap dan modern, cocok bila Anda menjamu tamu penting."),
        ],
        "en": {
            "description": "Our go-to for long trips: roomy, strong on hills, comfortable for six adults.",
            "summary": "The Toyota Innova Reborn is the car we recommend most for out-of-town trips. Six adults travel in comfort, there is room for suitcases, and it is just as happy on the toll road as on the climb to Puncak.",
            "idealFor": [
                "Out-of-town drives of three hours or more",
                "Larger families with suitcases",
                "Business guests and work trips",
                "Group airport transfers",
            ],
            "features": [
                tt("Room for six adults", "The middle and back rows stay comfortable for grown-ups on long drives."),
                tt("Steady on hills", "Stable and strong on climbs like Puncak and Lembang."),
                tt("A corporate favourite", "Often booked for company guests: comfortable and smart-looking."),
            ],
            "luggage": "2–3 medium suitcases with six passengers; 4 large suitcases with the third row folded.",
            "faq": [
                q("Why do you recommend the Innova Reborn so often?", "It strikes the right balance: plenty of room, comfortable over long distances, and cheaper than premium models like the Zenix."),
                q("Innova Reborn or Zenix?", "The Reborn is comfortable enough for most trips. The Zenix is newer, quieter and more modern inside, which is worth it when you are hosting important guests."),
            ],
        },
    },
    "car-toyota-zenix": {
        "travelUnit": "zenix",
        "description": "Generasi terbaru Innova dengan kabin lebih senyap, modern, dan lega.",
        "summary": "Toyota Innova Zenix adalah generasi terbaru Innova. Kabinnya lebih senyap dan modern, dengan ruang kaki yang lega di baris kedua. Pilihan tepat untuk tamu bisnis, keluarga yang ingin lebih nyaman, dan perjalanan panjang antar kota.",
        "idealFor": [
            "Menjemput tamu bisnis atau klien",
            "Perjalanan antar kota yang panjang",
            "Keluarga yang mengutamakan kenyamanan",
        ],
        "features": [
            tt("Kabin senyap", "Suara jalan dan mesin lebih teredam, nyaman untuk istirahat atau menelepon."),
            tt("Tampilan modern", "Desain terbaru, tampil rapi saat menjemput tamu penting."),
            tt("Baris kedua lega", "Ruang kaki lapang untuk perjalanan beberapa jam."),
        ],
        "luggage": "Dengan enam penumpang, muat 2–3 koper sedang. Lipat baris ketiga untuk bawaan lebih banyak.",
        "faq": [
            q("Apa bedanya Zenix dan Zenix Q Hybrid Modellista?", "Zenix Q Hybrid Modellista adalah varian tertinggi dengan kursi kapten yang lebih mewah dan tampilan Modellista. Zenix biasa sudah nyaman dan tarifnya lebih rendah."),
            q("Apakah Zenix cocok untuk menjemput tamu di bandara?", "Sangat cocok. Kabinnya senyap dan lega, dan tampilannya rapi untuk menyambut tamu perusahaan."),
        ],
        "en": {
            "description": "The latest-generation Innova: quieter, more modern and roomier.",
            "summary": "The Toyota Innova Zenix is the newest generation of the Innova. The cabin is quieter and more modern, with generous legroom in the middle row. A good choice for business guests, families who want extra comfort, and long intercity drives.",
            "idealFor": [
                "Picking up business guests or clients",
                "Long intercity drives",
                "Families who put comfort first",
            ],
            "features": [
                tt("Quiet cabin", "Less road and engine noise, so you can rest or take calls."),
                tt("Modern look", "The latest design, smart enough to greet important guests."),
                tt("Roomy middle row", "Plenty of legroom for drives of several hours."),
            ],
            "luggage": "2–3 medium suitcases with six passengers; fold the third row for more.",
            "faq": [
                q("How is the Zenix different from the Zenix Q Hybrid Modellista?", "The Q Hybrid Modellista is the top version, with plusher captain's chairs and the Modellista styling. The regular Zenix is already comfortable and costs less."),
                q("Is the Zenix a good airport pick-up car?", "Very. It is quiet, roomy and looks the part when you are meeting company guests."),
            ],
        },
    },
    "car-toyota-innova-venturer": {
        "description": "Innova berpenampilan sporty dengan kursi kapten di baris kedua.",
        "summary": "Toyota Innova Venturer adalah Innova dengan tampilan sporty dan kursi kapten di baris kedua. Dua penumpang utama duduk terpisah dengan sandaran tangan masing-masing, sehingga cocok untuk tamu bisnis dan perjalanan dinas pimpinan.",
        "idealFor": [
            "Perjalanan dinas pimpinan atau tamu penting",
            "Pasangan atau keluarga kecil yang ingin lebih lega",
            "Perjalanan luar kota dengan dua penumpang utama",
        ],
        "features": [
            tt("Kursi kapten", "Dua kursi terpisah di baris kedua, lebih nyaman dan mudah keluar-masuk."),
            tt("Tampilan sporty", "Penampilan lebih gagah dibanding Innova biasa."),
        ],
        "luggage": "Dengan lima penumpang, muat 2–3 koper sedang di belakang.",
        "faq": [
            q("Berapa penumpang yang bisa naik Venturer?", "Lima penumpang ditambah driver: dua di kursi kapten baris kedua dan tiga di baris ketiga."),
            q("Venturer atau Zenix?", "Venturer cocok bila Anda ingin kursi kapten dengan tarif yang sama dengan Zenix. Zenix lebih baru dan senyap, dengan jumlah kursi lebih banyak."),
        ],
        "en": {
            "description": "A sportier Innova with captain's chairs in the middle row.",
            "summary": "The Toyota Innova Venturer is a sportier-looking Innova with two captain's chairs in the middle row, each with its own armrest. It suits business guests and executives who want their own space on the road.",
            "idealFor": [
                "Executives and VIP guests",
                "Couples or small families who want more space",
                "Out-of-town trips with two main passengers",
            ],
            "features": [
                tt("Captain's chairs", "Two separate middle-row seats: more comfortable and easier to get in and out of."),
                tt("Sporty look", "A bolder look than the standard Innova."),
            ],
            "luggage": "2–3 medium suitcases with five passengers.",
            "faq": [
                q("How many passengers does the Venturer take?", "Five plus the driver: two in the middle-row captain's chairs and three in the back."),
                q("Venturer or Zenix?", "Choose the Venturer if you want captain's chairs at the Zenix price. The Zenix is newer and quieter, with more seats."),
            ],
        },
    },
    "car-toyota-zenix-q-hybrid-modellista": {
        "travelUnit": "zenixq",
        "description": "Varian Innova tertinggi: hybrid, kursi kapten mewah, tampilan Modellista.",
        "summary": "Toyota Innova Zenix Q Hybrid Modellista adalah varian Innova paling mewah. Baris keduanya berupa kursi kapten dengan sandaran kaki, kabinnya senyap berkat mesin hybrid, dan tampilannya eksklusif dengan paket Modellista. Pilihan setingkat di bawah Alphard untuk tamu VIP dan hari pernikahan.",
        "idealFor": [
            "Tamu VIP dan pimpinan perusahaan",
            "Mobil pengantin atau keluarga inti",
            "Perjalanan panjang yang ingin senyaman mungkin",
        ],
        "features": [
            tt("Kursi kapten dengan sandaran kaki", "Posisi duduk bisa direbahkan untuk beristirahat di perjalanan jauh."),
            tt("Hybrid dan senyap", "Mesin hybrid membuat kabin sangat tenang, terutama di kemacetan kota."),
            tt("Tampilan Modellista", "Paket bodi eksklusif yang tampil elegan untuk acara resmi."),
        ],
        "luggage": "Dengan lima penumpang, muat 2 koper sedang dan beberapa tas kabin.",
        "faq": [
            q("Zenix Q Hybrid Modellista atau Alphard?", "Zenix Q memberi kenyamanan kursi kapten dan kabin senyap dengan tarif lebih terjangkau. Alphard untuk kesan paling mewah dan ruang kabin terbesar."),
            q("Apakah bisa dipakai untuk mobil pengantin?", "Bisa. Unit ini sering dipilih untuk pengantin atau keluarga inti. Konsultasikan tanggal dan kebutuhan dekorasi lewat WhatsApp."),
        ],
        "en": {
            "description": "The top-of-the-range Innova: hybrid, luxurious captain's chairs, Modellista styling.",
            "summary": "The Toyota Innova Zenix Q Hybrid Modellista is the most luxurious Innova. The middle row has reclining captain's chairs with leg rests, the hybrid engine keeps the cabin very quiet, and the Modellista body kit gives it an exclusive look. It is one step below the Alphard for VIP guests and weddings.",
            "idealFor": [
                "VIP guests and senior executives",
                "Bridal or immediate-family car",
                "Long drives where comfort matters most",
            ],
            "features": [
                tt("Captain's chairs with leg rests", "Recline and rest properly on long journeys."),
                tt("Quiet hybrid", "The hybrid engine keeps things very calm, especially in city traffic."),
                tt("Modellista styling", "An exclusive body kit that looks right at formal events."),
            ],
            "luggage": "2 medium suitcases and a few cabin bags with five passengers.",
            "faq": [
                q("Zenix Q Hybrid Modellista or Alphard?", "The Zenix Q gives you captain's chairs and a quiet cabin for less. The Alphard is the most luxurious option with the largest cabin."),
                q("Can it be booked as a wedding car?", "Yes, it is a popular choice for the couple or close family. Message us with your date and any decoration plans."),
            ],
        },
    },
    "car-toyota-fortuner": {
        "description": "SUV besar yang gagah dan tangguh untuk jalan pegunungan maupun acara resmi.",
        "summary": "Toyota Fortuner adalah SUV besar dengan posisi duduk tinggi dan tampilan gagah. Mobil ini tangguh di jalan pegunungan dan tetap pantas untuk acara resmi, sehingga sering dipilih untuk tamu penting, pengawalan acara, dan perjalanan ke daerah dengan jalan yang menantang.",
        "idealFor": [
            "Tamu penting yang ingin kesan gagah",
            "Perjalanan ke pegunungan dan jalan menantang",
            "Mobil pendamping acara pernikahan",
        ],
        "features": [
            tt("Tangguh di medan berat", "Rangka kokoh dan jarak ke tanah tinggi untuk jalan pegunungan."),
            tt("Tampilan gagah", "Pantas untuk menyambut tamu atau mendampingi acara resmi."),
        ],
        "luggage": "Dengan lima penumpang, muat 2–3 koper sedang.",
        "faq": [
            q("Apakah Fortuner tersedia dengan tarif all-in?", "Fortuner tersedia dengan tarif dalam kota 12 jam. Untuk perjalanan luar kota, admin menghitungkan tarif sesuai rute dan durasi."),
            q("Fortuner atau Innova untuk ke luar kota?", "Innova lebih lega untuk enam penumpang. Fortuner lebih cocok bila jalannya menantang atau Anda ingin tampilan lebih gagah."),
        ],
        "en": {
            "description": "A big, commanding SUV, equally at home in the mountains and at formal events.",
            "summary": "The Toyota Fortuner is a large SUV with a high driving position and a strong presence. It copes with mountain roads and still looks right at formal occasions, so it is often booked for VIP guests, event convoys and trips on demanding roads.",
            "idealFor": [
                "VIP guests who want to arrive in style",
                "Mountain trips and demanding roads",
                "Escort car for weddings",
            ],
            "features": [
                tt("Built for rough roads", "A sturdy body-on-frame build and high clearance for mountain roads."),
                tt("Commanding presence", "Right for welcoming guests or accompanying formal events."),
            ],
            "luggage": "2–3 medium suitcases with five passengers.",
            "faq": [
                q("Is there an all-in rate for the Fortuner?", "The Fortuner has a 12-hour in-town rate. For out-of-town trips we quote based on the route and hours."),
                q("Fortuner or Innova for a long trip?", "The Innova has more room for six people. The Fortuner is the better pick for rough roads, or when you want a more imposing car."),
            ],
        },
    },
    "car-toyota-hiace-commuter": {
        "description": "Van rombongan beratap tinggi untuk satu kantor, satu keluarga besar, atau satu tim.",
        "summary": "Toyota Hiace Commuter adalah van beratap tinggi untuk rombongan besar. Satu rombongan cukup satu mobil dan satu driver, jadi jadwal lebih mudah diatur dan biaya lebih efisien dibanding menyewa beberapa MPV.",
        "idealFor": [
            "Outing kantor dan kunjungan kerja rombongan",
            "Keluarga besar ke acara atau wisata",
            "Tim olahraga, komunitas, atau sekolah",
            "Antar-jemput bandara rombongan",
        ],
        "features": [
            tt("Satu mobil untuk satu rombongan", "Semua peserta berangkat dan tiba bersama, tanpa menunggu mobil lain."),
            tt("Atap tinggi", "Mudah naik-turun dan tidak terasa sesak untuk perjalanan beberapa jam."),
            tt("Lebih efisien", "Biasanya lebih hemat daripada menyewa dua atau tiga MPV sekaligus."),
        ],
        "luggage": "Bawaan terbatas saat semua kursi terisi. Sampaikan jumlah koper agar admin menyarankan susunan kursi.",
        "faq": [
            q("Berapa penumpang Hiace Commuter?", "Kapasitasnya tertera di halaman ini dan sudah termasuk driver. Bila rombongan membawa banyak koper, kurangi satu atau dua penumpang supaya bawaan muat."),
            q("Apakah Hiace bisa naik ke Puncak?", "Bisa. Driver kami terbiasa membawa Hiace di jalur Puncak dan mengatur jam berangkat mengikuti sistem satu arah."),
        ],
        "en": {
            "description": "A high-roof group van: one car for the whole office, family or team.",
            "summary": "The Toyota Hiace Commuter is a high-roof van for large groups. One van and one driver keep everyone together, which makes the schedule simpler and usually costs less than booking several smaller cars.",
            "idealFor": [
                "Company outings and group business visits",
                "Big families heading to an event or on holiday",
                "Sports teams, clubs and school groups",
                "Group airport transfers",
            ],
            "features": [
                tt("One van, one group", "Everyone leaves and arrives together; no waiting for a second car."),
                tt("High roof", "Easy to get in and out, and never cramped over a few hours."),
                tt("Better value", "Usually cheaper than hiring two or three MPVs."),
            ],
            "luggage": "Luggage space is limited when every seat is taken. Tell us how many suitcases you have and we'll suggest a seating plan.",
            "faq": [
                q("How many passengers does the Hiace Commuter take?", "Capacity is shown on this page and includes the driver. With a lot of suitcases, plan for one or two fewer passengers so the bags fit."),
                q("Can a Hiace go up to Puncak?", "Yes. Our drivers regularly take the Hiace up to Puncak and time the trip around the one-way traffic system."),
            ],
        },
    },
    "car-toyota-hiace-premio": {
        "description": "Van rombongan generasi terbaru dengan kabin lebih senyap dan kursi lebih nyaman.",
        "summary": "Toyota Hiace Premio adalah Hiace generasi terbaru dengan kabin yang lebih senyap, kursi lebih empuk, dan pendingin udara yang merata sampai belakang. Pilihan untuk rombongan yang ingin kenyamanan di atas Hiace Commuter, misalnya tamu perusahaan atau perjalanan wisata yang panjang.",
        "idealFor": [
            "Rombongan tamu perusahaan",
            "Perjalanan wisata rombongan yang panjang",
            "Keluarga besar ke acara pernikahan",
        ],
        "features": [
            tt("Lebih nyaman dari Commuter", "Kursi lebih empuk dan kabin lebih senyap untuk perjalanan berjam-jam."),
            tt("Tampilan modern", "Desain terbaru yang pantas untuk menjemput tamu rombongan."),
        ],
        "luggage": "Ruang bagasi di belakang kursi terakhir. Sampaikan jumlah koper saat memesan.",
        "faq": [
            q("Berapa tarif Hiace Premio?", "Tarif Hiace Premio dihitung per perjalanan sesuai tanggal, durasi, dan rute. Kirim rencana perjalanan Anda lewat WhatsApp untuk penawaran tertulis."),
            q("Hiace Premio atau Commuter?", "Commuter lebih hemat untuk kebutuhan rombongan biasa. Premio untuk rombongan yang ingin lebih nyaman atau untuk menjamu tamu."),
        ],
        "en": {
            "description": "The latest group van, with a quieter cabin and more comfortable seats.",
            "summary": "The Toyota Hiace Premio is the newest Hiace: a quieter cabin, softer seats and air conditioning that reaches the back rows. It is the step up from the Commuter for company guests or long group tours.",
            "idealFor": [
                "Groups of company guests",
                "Long group sightseeing tours",
                "Extended family heading to a wedding",
            ],
            "features": [
                tt("A step up from the Commuter", "Softer seats and a quieter cabin for long hours on the road."),
                tt("Modern design", "Smart enough to collect a group of guests."),
            ],
            "luggage": "Luggage goes behind the last row. Tell us how many suitcases when you book.",
            "faq": [
                q("How much is the Hiace Premio?", "It is quoted per trip, based on date, hours and route. Send us your plans on WhatsApp for a written quote."),
                q("Hiace Premio or Commuter?", "The Commuter is the budget choice for most groups. The Premio is for groups who want more comfort, or when you are hosting guests."),
            ],
        },
    },
    "car-toyota-alphard": {
        "description": "MPV paling mewah di armada kami, untuk tamu VIP dan hari pernikahan.",
        "summary": "Toyota Alphard adalah MPV paling mewah di armada Arasya. Kursi kapten baris kedua yang lapang, kabin yang tenang, dan pintu geser elektrik membuatnya menjadi pilihan utama untuk pengantin, tamu VIP, dan pimpinan perusahaan.",
        "idealFor": [
            "Mobil pengantin",
            "Menjemput tamu VIP atau pejabat",
            "Perjalanan pimpinan perusahaan",
        ],
        "features": [
            tt("Kursi kapten lapang", "Kursi baris kedua yang lebar dan empuk, dengan ruang kaki sangat luas."),
            tt("Kesan paling mewah", "Tampilan yang langsung dikenali sebagai mobil tamu penting."),
            tt("Pintu geser elektrik", "Mudah naik-turun, termasuk dengan gaun atau pakaian resmi."),
        ],
        "luggage": "Dengan lima penumpang, muat 2 koper sedang dan tas kabin.",
        "faq": [
            q("Berapa tarif sewa Alphard?", "Tarif Alphard dihitung per acara atau perjalanan, menyesuaikan tanggal, durasi, dan rute. Kirim detailnya lewat WhatsApp untuk penawaran tertulis."),
            q("Apakah Alphard bisa dihias untuk pernikahan?", "Bisa dengan hiasan yang tidak merusak bodi. Sampaikan rencana dekorasi saat konsultasi agar admin mengonfirmasi."),
        ],
        "en": {
            "description": "The most luxurious MPV in our fleet, for VIP guests and weddings.",
            "summary": "The Toyota Alphard is the most luxurious car in the Arasya fleet. Spacious captain's chairs, a hushed cabin and powered sliding doors make it the first choice for weddings, VIP guests and senior executives.",
            "idealFor": [
                "Wedding car",
                "Collecting VIPs and officials",
                "Executive travel",
            ],
            "features": [
                tt("Spacious captain's chairs", "Wide, cushioned middle-row seats with a lot of legroom."),
                tt("Instantly premium", "The car everyone recognises as the one for important guests."),
                tt("Powered sliding doors", "Easy to get in and out of, even in a gown or formal wear."),
            ],
            "luggage": "2 medium suitcases and cabin bags with five passengers.",
            "faq": [
                q("How much does it cost to hire an Alphard?", "The Alphard is quoted per event or trip, depending on date, hours and route. Send us the details on WhatsApp for a written quote."),
                q("Can the Alphard be decorated for a wedding?", "Yes, with decorations that don't damage the paintwork. Tell us your plans when you ask for a quote."),
            ],
        },
    },
    "car-isuzu-elf-long": {
        "description": "Microbus untuk rombongan besar, satu mobil untuk hampir dua puluh orang.",
        "summary": "Isuzu Elf Long adalah microbus untuk rombongan besar, misalnya satu divisi kantor, rombongan pengajian, atau keluarga besar. Dengan satu mobil dan satu driver, seluruh rombongan berangkat dan tiba bersama.",
        "idealFor": [
            "Rombongan besar kantor atau komunitas",
            "Ziarah dan perjalanan religi rombongan",
            "Keluarga besar ke acara di luar kota",
        ],
        "features": [
            tt("Kapasitas terbesar", "Unit dengan kapasitas penumpang paling banyak di armada kami."),
            tt("Hemat untuk rombongan", "Biaya per orang jauh lebih rendah dibanding menyewa beberapa mobil."),
        ],
        "luggage": "Bagasi terbatas. Untuk rombongan dengan banyak koper, sampaikan saat memesan agar admin menyarankan susunan kursi.",
        "faq": [
            q("Apakah Elf Long bisa masuk ke semua jalan?", "Elf Long cukup panjang, jadi untuk jalan sempit atau area parkir terbatas, sampaikan alamat tujuan saat memesan. Admin akan memastikan rutenya atau menyarankan unit lain."),
            q("Berapa tarif Elf Long?", "Tarif dihitung per perjalanan sesuai tanggal, durasi, dan rute. Kirim rencana perjalanan lewat WhatsApp untuk penawaran tertulis."),
        ],
        "en": {
            "description": "A minibus for big groups: one vehicle for close to twenty people.",
            "summary": "The Isuzu Elf Long is a minibus for large groups, such as a whole department, a community group or an extended family. One vehicle and one driver keep the whole group together from pick-up to drop-off.",
            "idealFor": [
                "Large company or community groups",
                "Group pilgrimages and religious trips",
                "Extended families travelling to an event",
            ],
            "features": [
                tt("Largest capacity", "The vehicle that carries the most passengers in our fleet."),
                tt("Low cost per person", "Far cheaper per head than hiring several cars."),
            ],
            "luggage": "Luggage space is limited. If your group has a lot of suitcases, tell us when you book and we'll suggest a seating plan.",
            "faq": [
                q("Can the Elf Long reach any address?", "It is a long vehicle, so if the destination has narrow roads or tight parking, send us the address when you book. We'll check the route or suggest another vehicle."),
                q("How much is the Elf Long?", "It is quoted per trip, based on date, hours and route. Send us your plans on WhatsApp for a written quote."),
            ],
        },
    },
}
