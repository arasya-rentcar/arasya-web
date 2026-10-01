"""New service cities (domestic and international), plus copy fixes so no
page implies Arasya only drives between a handful of cities.

Domestic cities use the fleet's rates as a reference (pricing "reference":
the admin confirms the final rate for that city). International cities are
quoted per trip in rupiah (pricing "quote") and list car classes instead of
the Indonesian fleet.
"""


def q(question, answer):
    return {"question": question, "answer": answer}


def d(name, area, text):
    return {"name": name, "area": area, "text": text}


def r(to, duration, note):
    return {"to": to, "duration": duration, "note": note}


def para(key, text):
    return {"_type": "block", "_key": key, "style": "normal", "markDefs": [],
            "children": [{"_type": "span", "_key": key + "s", "text": text, "marks": []}]}


def car(ref):
    return {"_type": "reference", "_ref": ref}


PAYMENT = "Setelah invoice diterbitkan, Anda mentransfer DP 20% ke rekening resmi BCA a.n. PT Ayomi Raya Karsa. Pelunasan dilakukan saat driver bertemu Anda sebelum keberangkatan, secara tunai atau transfer."


def domestic_faq(city, pickup, extra):
    return [
        q("Apakah tarif sudah termasuk supir?", "Ya, seluruh tarif sudah termasuk jasa driver profesional. Tersedia dua pilihan: tarif Dalam Kota 12 jam (belum termasuk BBM, tol, parkir, dan makan driver) atau tarif All-in (sudah termasuk BBM, tol, dan makan driver)."),
        q(f"Apakah bisa ke luar kota dari {city}?", f"Bisa. Dari {city} kami melayani perjalanan ke kota mana pun, dalam provinsi maupun antarprovinsi, termasuk sewa beberapa hari. Tarif disesuaikan dengan jarak dan durasi, dan dikonfirmasi tertulis sebelum berangkat."),
        q(f"Di mana saja titik penjemputan di {city}?", f"Driver menjemput di alamat mana pun di {city} dan sekitarnya, termasuk {pickup}."),
        *extra,
        q("Bagaimana ketentuan pembayarannya?", PAYMENT),
    ]


SECTION_ORDERS = [
    ["answer", "fleet", "editorial", "destinations", "trust", "routes", "testimonials", "faq"],
    ["answer", "fleet", "destinations", "routes", "editorial", "testimonials", "trust", "faq"],
    ["answer", "editorial", "fleet", "routes", "destinations", "trust", "faq", "testimonials"],
    ["answer", "fleet", "trust", "routes", "destinations", "editorial", "faq", "testimonials"],
    ["answer", "fleet", "routes", "editorial", "destinations", "testimonials", "trust", "faq"],
]


def city(id_, name, code, slug, *, eyebrow, lead, seo, editorial, pickup, areas, destinations, routes, faq_extra, hero_car, order, country="ID", pricing="reference", **rest):
    key = id_.replace("city-", "")
    doc = {
        "_id": id_,
        "_type": "city",
        "name": name,
        "code": code,
        "slug": {"_type": "slug", "current": slug},
        "country": country,
        "isHeadquarters": False,
        "pricing": pricing,
        "hero": {"eyebrow": eyebrow, "title": f"Sewa Mobil {name} dengan Supir", "lead": lead, "car": car(hero_car)},
        "sections": SECTION_ORDERS[order % len(SECTION_ORDERS)],
        "editorial": {
            "eyebrow": editorial[0],
            "title": editorial[1],
            "lead": editorial[2],
            "body": [para(f"{key}e{i}", t) for i, t in enumerate(editorial[3:])],
        },
        "pickupPoints": pickup,
        "areaServed": areas,
        "destinations": destinations,
        "routes": routes,
        "faq": domestic_faq(name, pickup, faq_extra) if country == "ID" else faq_extra,
        "seo": seo,
    }
    doc.update(rest)
    return doc


CITIES = [
    city(
        "city-bekasi", "Bekasi", "BKS", "sewa-mobil-bekasi", order=0, hero_car="car-toyota-innova-venturer",
        eyebrow="Kota Bekasi",
        lead="Untuk kunjungan kerja ke kawasan industri, antar-jemput bandara, dan perjalanan keluarga dari Bekasi ke mana pun tujuan Anda.",
        seo={"title": "Sewa Mobil Bekasi dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Bekasi dan Cikarang untuk kunjungan kerja, antar-jemput bandara, dan perjalanan luar kota. Tarif 12 jam atau all-in, pesan via WhatsApp."},
        editorial=("Mengenal Bekasi", "Kota penyangga di timur Jakarta",
                   "Bekasi tumbuh sebagai kota hunian dan pusat industri di sisi timur Jakarta. Setiap hari ribuan orang bergerak antara rumah, kantor di Jakarta, dan kawasan industri di Cikarang.",
                   "Jalur utamanya, Tol Jakarta–Cikampek, termasuk ruas tersibuk di Indonesia. Kepadatannya bisa berubah drastis dalam satu jam, terutama pagi arah Jakarta dan sore arah Cikarang.",
                   "Driver Arasya terbiasa dengan pola ini: kapan memakai tol layang, kapan lewat jalur arteri, dan titik penjemputan yang praktis di kawasan industri maupun perumahan."),
        pickup="Stasiun Bekasi, kawasan Summarecon, kawasan industri Cikarang, dan hotel tempat Anda menginap",
        areas=["Bekasi", "Cikarang", "Tambun", "Jabodetabek"],
        destinations=[
            d("Kawasan Industri Cikarang", "Kabupaten Bekasi", "Jababeka, MM2100, dan kawasan industri lain yang sering menjadi tujuan kunjungan kerja dan audit pabrik."),
            d("Summarecon Bekasi", "Bekasi Utara", "Kawasan belanja dan kuliner yang ramai di akhir pekan, mudah dijangkau dari tol."),
            d("Curug Parigi", "Bantargebang", "Air terjun kecil dengan tebing batu, pilihan wisata alam terdekat dari pusat kota."),
            d("Muara Gembong", "Pesisir utara", "Ekowisata hutan mangrove dan pantai di ujung utara Kabupaten Bekasi."),
        ],
        routes=[
            r("Bandara Soekarno-Hatta", "±1,5–2 jam", "Via tol dalam kota dan tol bandara, tergantung jam berangkat."),
            r("Jakarta pusat", "±1–1,5 jam", "Via Tol Jakarta–Cikampek atau tol layang."),
            r("Bandung", "±2,5–3 jam", "Via Tol Cipularang."),
            r("Puncak", "±2–3 jam", "Via Jagorawi, menyesuaikan sistem satu arah akhir pekan."),
        ],
        faq_extra=[q("Apakah bisa untuk kunjungan ke kawasan industri Cikarang?", "Bisa. Driver kami terbiasa keluar-masuk kawasan industri di Cikarang dan mengatur jam berangkat supaya tamu tiba sebelum jadwal rapat.")],
    ),
    city(
        "city-depok", "Depok", "DPK", "sewa-mobil-depok", order=1, hero_car="car-mitsubishi-xpander",
        eyebrow="Kota Depok",
        lead="Untuk keperluan keluarga, kampus, dan kantor di Depok, antar-jemput bandara, serta perjalanan dari Depok ke kota mana pun.",
        seo={"title": "Sewa Mobil Depok dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Depok untuk keluarga, acara kampus, dan perjalanan luar kota. Tarif 12 jam atau all-in, pesan via WhatsApp."},
        editorial=("Mengenal Depok", "Kota kampus di antara Jakarta dan Bogor",
                   "Depok dikenal sebagai kota pendidikan dengan kampus Universitas Indonesia, sekaligus kota hunian bagi banyak pekerja Jakarta.",
                   "Jalan Margonda menjadi poros utama kota dan hampir selalu padat. Untuk menuju Jakarta atau bandara, tol seperti Cijago dan Desari sering jauh lebih cepat daripada jalan arteri.",
                   "Driver Arasya memilih jalur yang tepat untuk jam Anda berangkat, termasuk untuk acara wisuda dan kunjungan keluarga yang biasanya berbarengan dengan jam sibuk."),
        pickup="Stasiun Depok dan Depok Baru, kawasan Margonda, kampus UI, dan hotel tempat Anda menginap",
        areas=["Depok", "Cinere", "Sawangan", "Jabodetabek"],
        destinations=[
            d("Kampus Universitas Indonesia", "Beji", "Kampus dengan danau dan hutan kota, ramai saat wisuda dan acara kampus."),
            d("Masjid Kubah Emas", "Limo", "Masjid berkubah emas yang menjadi tujuan wisata religi keluarga."),
            d("Jalan Margonda", "Pusat Kota", "Pusat belanja, kuliner, dan perkantoran di jantung Depok."),
        ],
        routes=[
            r("Jakarta Selatan", "±45–60 menit", "Via Tol Desari atau Tol Cijago."),
            r("Bogor", "±45–60 menit", "Via Tol Jagorawi."),
            r("Bandara Soekarno-Hatta", "±1,5–2 jam", "Via tol lingkar luar Jakarta dan tol bandara."),
        ],
        faq_extra=[q("Apakah bisa untuk acara wisuda di UI?", "Bisa. Sampaikan jadwal acara dan jumlah keluarga yang ikut; admin menyarankan unit dan jam jemput supaya tidak terjebak antrean masuk kampus.")],
    ),
    city(
        "city-tangerang", "Tangerang", "TNG", "sewa-mobil-tangerang", order=2, hero_car="car-toyota-zenix",
        eyebrow="Tangerang & Tangerang Selatan",
        lead="Untuk antar-jemput Bandara Soekarno-Hatta, acara di BSD, kunjungan kerja, dan perjalanan dari Tangerang ke kota mana pun.",
        seo={"title": "Sewa Mobil Tangerang dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Tangerang, BSD, dan Alam Sutera. Antar-jemput Bandara Soekarno-Hatta, pameran di ICE BSD, dan perjalanan luar kota."},
        editorial=("Mengenal Tangerang", "Rumah Bandara Soekarno-Hatta",
                   "Bandara Soekarno-Hatta berada di wilayah Kota Tangerang, sementara Tangerang Selatan berkembang menjadi pusat bisnis dan acara di BSD, Alam Sutera, dan Gading Serpong.",
                   "Banyak tamu kami datang untuk pameran di ICE BSD, rapat di kawasan bisnis, atau transit sebelum penerbangan. Jaraknya dekat, tetapi akses ke bandara dan tol Jakarta bisa padat di jam sibuk.",
                   "Driver Arasya mengenal jalur alternatif antara BSD, bandara, dan Jakarta, dan terbiasa menunggu di area kedatangan saat pesawat terlambat."),
        pickup="Bandara Soekarno-Hatta, ICE BSD, kawasan Alam Sutera dan Gading Serpong, dan hotel tempat Anda menginap",
        areas=["Kota Tangerang", "Tangerang Selatan", "BSD", "Alam Sutera", "Gading Serpong"],
        destinations=[
            d("ICE BSD", "BSD City", "Pusat konvensi dan pameran terbesar di kawasan ini, tujuan utama tamu bisnis."),
            d("Pasar Lama & Klenteng Boen Tek Bio", "Kota Tangerang", "Kawasan kuliner malam dan klenteng tua di pusat kota lama Tangerang."),
            d("Masjid Raya Al-A'zhom", "Kota Tangerang", "Masjid besar dengan arsitektur kubah bertumpuk, ikon kota Tangerang."),
            d("Kawasan Alam Sutera", "Serpong Utara", "Kawasan bisnis, belanja, dan kuliner yang terhubung langsung dengan tol."),
        ],
        routes=[
            r("Bandara Soekarno-Hatta", "±30–60 menit", "Dari BSD atau Alam Sutera, tergantung jalur tol."),
            r("Jakarta pusat", "±1–1,5 jam", "Via Tol Jakarta–Tangerang atau Tol JORR."),
            r("Bogor", "±1,5–2 jam", "Via tol lingkar luar dan Jagorawi."),
            r("Anyer", "±2–2,5 jam", "Via Tol Jakarta–Merak."),
        ],
        faq_extra=[q("Apakah bisa menjemput di Bandara Soekarno-Hatta tengah malam?", "Bisa. Admin kami siaga 24 jam. Kirim nomor penerbangan saat memesan, driver memantau jadwal pendaratan dan menunggu di area kedatangan.")],
    ),
    city(
        "city-cirebon", "Cirebon", "CBN", "sewa-mobil-cirebon", order=3, hero_car="car-toyota-innova-reborn",
        eyebrow="Kota Cirebon",
        lead="Untuk wisata keraton dan kuliner, kunjungan kerja di jalur pantura, dan perjalanan dari Cirebon ke kota mana pun.",
        seo={"title": "Sewa Mobil Cirebon dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Cirebon untuk wisata keraton, batik Trusmi, kuliner, dan perjalanan luar kota. Tarif 12 jam atau all-in, pesan via WhatsApp."},
        editorial=("Mengenal Cirebon", "Kota Udang di persimpangan Jawa Barat dan Jawa Tengah",
                   "Cirebon adalah kota pelabuhan tua dengan dua keraton, sentra batik Trusmi, dan kuliner khas seperti empal gentong dan nasi jamblang.",
                   "Letaknya strategis: terhubung ke Jakarta lewat Tol Cipali, ke Jawa Tengah lewat Tol Trans-Jawa, dan dekat dengan Bandara Kertajati di Majalengka.",
                   "Driver Arasya bisa mengatur perjalanan sehari penuh di dalam kota, mulai dari keraton, belanja batik, sampai kuliner, atau menjadi titik singgah dalam perjalanan panjang antar provinsi."),
        pickup="Stasiun Cirebon (Kejaksan), Bandara Kertajati, kawasan Trusmi, dan hotel tempat Anda menginap",
        areas=["Cirebon", "Kabupaten Cirebon", "Kuningan", "Majalengka", "Indramayu"],
        destinations=[
            d("Keraton Kasepuhan", "Pusat Kota", "Keraton tertua di Cirebon dengan perpaduan arsitektur Jawa, Tionghoa, dan Eropa."),
            d("Sentra Batik Trusmi", "Plered", "Deretan toko dan bengkel batik khas Cirebon dengan motif mega mendung."),
            d("Taman Air Gua Sunyaragi", "Pusat Kota", "Kompleks gua buatan dari batu karang peninggalan keraton."),
            d("Kawasan Linggarjati", "Kuningan", "Udara sejuk di kaki Gunung Ciremai, sekitar satu jam dari kota."),
        ],
        routes=[
            r("Jakarta", "±3–3,5 jam", "Via Tol Cipali dan Tol Jakarta–Cikampek."),
            r("Bandung", "±2,5–3,5 jam", "Via Tol Cisumdawu atau jalur Sumedang."),
            r("Bandara Kertajati", "±1 jam", "Via Tol Cipali."),
            r("Semarang", "±3,5–4 jam", "Via Tol Trans-Jawa."),
        ],
        faq_extra=[q("Apakah bisa menjemput di Bandara Kertajati?", "Bisa. Kirim nomor penerbangan saat memesan, driver menunggu di area kedatangan dan mengantar Anda ke Cirebon atau kota tujuan lain.")],
    ),
    city(
        "city-pekalongan", "Pekalongan", "PKL", "sewa-mobil-pekalongan", order=4, hero_car="car-mitsubishi-xpander",
        eyebrow="Kota Pekalongan",
        lead="Untuk belanja batik, kunjungan kerja, dan acara keluarga di Pekalongan, serta perjalanan dari Pekalongan ke kota mana pun.",
        seo={"title": "Sewa Mobil Pekalongan dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Pekalongan untuk belanja batik, kunjungan kerja, dan perjalanan luar kota lewat Tol Trans-Jawa. Pesan via WhatsApp."},
        editorial=("Mengenal Pekalongan", "Kota Batik di pesisir utara Jawa Tengah",
                   "Pekalongan dikenal sebagai Kota Batik, dengan kampung-kampung batik dan museum yang menyimpan koleksi dari seluruh Nusantara.",
                   "Banyak tamu kami datang untuk belanja batik dalam jumlah besar, kunjungan ke pabrik dan konveksi, atau acara keluarga. Di luar kota, hutan dan air terjun Petungkriyono menawarkan suasana yang sangat berbeda.",
                   "Dengan Tol Trans-Jawa, Pekalongan kini dekat dengan Semarang dan Cirebon. Driver Arasya bisa mengatur perjalanan sehari penuh maupun perjalanan panjang antar provinsi."),
        pickup="Stasiun Pekalongan, kawasan Kauman, sentra batik, dan hotel tempat Anda menginap",
        areas=["Pekalongan", "Kabupaten Pekalongan", "Batang", "Pemalang"],
        destinations=[
            d("Museum Batik Pekalongan", "Pusat Kota", "Koleksi batik dari berbagai daerah di Indonesia, lengkap dengan kelas membatik."),
            d("Kampung Batik Kauman", "Pusat Kota", "Kampung dengan rumah-rumah pembatik dan toko batik tulis maupun cap."),
            d("Petungkriyono", "Kabupaten Pekalongan", "Hutan hujan dengan air terjun dan sungai jernih di dataran tinggi selatan."),
        ],
        routes=[
            r("Semarang", "±1,5–2 jam", "Via Tol Trans-Jawa."),
            r("Cirebon", "±2–2,5 jam", "Via Tol Trans-Jawa."),
            r("Dieng", "±3 jam", "Via Batang dan Wonosobo, jalur menanjak."),
        ],
        faq_extra=[q("Apakah bisa diantar keliling sentra batik seharian?", "Bisa. Tarif Dalam Kota 12 jam cocok untuk belanja batik di beberapa lokasi. Sampaikan daftar tempat yang ingin dikunjungi, driver akan menyusun urutannya.")],
    ),
    city(
        "city-semarang", "Semarang", "SRG", "sewa-mobil-semarang", order=0, hero_car="car-toyota-zenix",
        eyebrow="Kota Semarang",
        lead="Untuk perjalanan bisnis, wisata kota lama, dan antar-jemput bandara di Semarang, serta perjalanan dari Semarang ke kota mana pun.",
        seo={"title": "Sewa Mobil Semarang dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Semarang untuk bisnis, wisata Lawang Sewu dan Kota Lama, antar-jemput bandara, dan perjalanan luar kota. Pesan via WhatsApp."},
        editorial=("Mengenal Semarang", "Ibu kota Jawa Tengah di antara pantai dan perbukitan",
                   "Semarang adalah pusat bisnis dan pemerintahan Jawa Tengah. Kota bawahnya berada di pesisir, sementara kawasan atasnya menanjak ke perbukitan dengan udara lebih sejuk.",
                   "Tamu kami biasanya datang untuk urusan kantor, menghadiri acara, atau menjadikan Semarang titik awal perjalanan ke Solo, Jogja, dan Dieng lewat jaringan tol.",
                   "Driver Arasya mengenal jalur naik-turun kota, lokasi parkir di kawasan wisata seperti Kota Lama, dan waktu tempuh realistis ke kota-kota sekitarnya."),
        pickup="Bandara Ahmad Yani, Stasiun Tawang dan Poncol, kawasan Simpang Lima, dan hotel tempat Anda menginap",
        areas=["Semarang", "Ungaran", "Kendal", "Demak"],
        destinations=[
            d("Lawang Sewu", "Pusat Kota", "Bangunan bersejarah bekas kantor perusahaan kereta api zaman Belanda."),
            d("Kota Lama", "Semarang Utara", "Kawasan bangunan kolonial, Gereja Blenduk, dan kafe di sekitar taman."),
            d("Klenteng Sam Poo Kong", "Semarang Barat", "Kompleks klenteng yang dikaitkan dengan persinggahan Laksamana Cheng Ho."),
            d("Masjid Agung Jawa Tengah", "Gayamsari", "Masjid besar dengan payung raksasa dan menara pandang ke seluruh kota."),
        ],
        routes=[
            r("Solo", "±1,5–2 jam", "Via Tol Semarang–Solo."),
            r("Yogyakarta", "±3–3,5 jam", "Via Magelang atau lewat tol ke arah Solo."),
            r("Dieng", "±3,5 jam", "Via Wonosobo, jalur pegunungan."),
            r("Kudus", "±1 jam", "Via jalur pantura timur."),
        ],
        faq_extra=[q("Apakah bisa menjemput di Bandara Ahmad Yani?", "Bisa. Kirim nomor penerbangan saat memesan, driver memantau jadwal pendaratan dan menunggu di area kedatangan.")],
    ),
    city(
        "city-solo", "Solo", "SOC", "sewa-mobil-solo", order=1, hero_car="car-toyota-innova-reborn",
        eyebrow="Kota Surakarta",
        lead="Untuk wisata keraton dan batik, acara keluarga, dan perjalanan bisnis di Solo, serta perjalanan dari Solo ke kota mana pun.",
        seo={"title": "Sewa Mobil Solo dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Solo (Surakarta) untuk wisata keraton, batik, Tawangmangu, dan perjalanan luar kota. Tarif 12 jam atau all-in, pesan via WhatsApp."},
        editorial=("Mengenal Solo", "Kota budaya yang tenang di tengah Jawa",
                   "Solo atau Surakarta adalah kota keraton dengan tradisi Jawa yang kuat, pusat batik, dan kuliner seperti nasi liwet, selat solo, dan tengkleng.",
                   "Kotanya relatif lengang dibanding kota besar lain, tetapi banyak tujuan terbaiknya ada di luar kota: Tawangmangu dan kaki Gunung Lawu di timur, serta candi-candi di lerengnya.",
                   "Dengan tol yang menghubungkan Solo ke Semarang dan ke arah Jawa Timur, driver Arasya bisa mengatur wisata sehari di Solo maupun perjalanan panjang ke kota lain."),
        pickup="Bandara Adi Soemarmo, Stasiun Solo Balapan dan Purwosari, dan hotel tempat Anda menginap",
        areas=["Surakarta", "Sukoharjo", "Karanganyar", "Boyolali", "Klaten"],
        destinations=[
            d("Keraton Kasunanan Surakarta", "Pusat Kota", "Istana keraton dengan museum dan alun-alun di pusat kota lama."),
            d("Pura Mangkunegaran", "Pusat Kota", "Istana dengan pendopo besar dan koleksi pusaka Mangkunegaran."),
            d("Kampung Batik Laweyan", "Laweyan", "Kampung saudagar batik dengan rumah-rumah tua dan toko batik."),
            d("Tawangmangu", "Karanganyar", "Kawasan pegunungan dengan air terjun Grojogan Sewu dan udara sejuk."),
        ],
        routes=[
            r("Yogyakarta", "±1,5–2 jam", "Via jalur Klaten atau tol."),
            r("Semarang", "±1,5–2 jam", "Via Tol Semarang–Solo."),
            r("Tawangmangu", "±1,5 jam", "Jalur menanjak ke lereng Gunung Lawu."),
            r("Madiun", "±1,5–2 jam", "Via Tol Trans-Jawa."),
        ],
        faq_extra=[q("Apakah bisa wisata Solo dan Tawangmangu dalam sehari?", "Bisa dengan tarif 12 jam. Driver biasanya menyarankan berangkat ke Tawangmangu pagi hari dan kembali ke kota untuk wisata keraton dan kuliner di sore hari.")],
    ),
    city(
        "city-jogja", "Jogja", "JOG", "sewa-mobil-jogja", order=2, hero_car="car-toyota-innova-reborn",
        eyebrow="Daerah Istimewa Yogyakarta",
        lead="Untuk wisata candi, keraton, dan pantai selatan, perjalanan bisnis, serta perjalanan dari Jogja ke kota mana pun.",
        seo={"title": "Sewa Mobil Jogja dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Jogja untuk wisata Malioboro, Prambanan, Borobudur, dan pantai Gunungkidul. Tarif 12 jam atau all-in, pesan via WhatsApp."},
        editorial=("Mengenal Yogyakarta", "Daerah Istimewa dengan destinasi yang tersebar luas",
                   "Yogyakarta memadukan keraton, candi warisan dunia, dan garis pantai selatan dalam satu wilayah, dan paling nyaman dijelajahi dengan mobil pribadi bersama supir.",
                   "Jarak antardestinasi cukup jauh dan karakternya beragam: jalur berkelok menuju perbukitan Gunungkidul, kawasan Malioboro dan Keraton yang padat dengan kantong parkir terbatas, hingga rute lintas kabupaten menuju Borobudur di Magelang.",
                   "Supir Arasya menyusun urutan kunjungan yang efisien, memahami jam-jam padat, dan mengenal titik penjemputan di Bandara YIA, Stasiun Tugu, maupun hotel Anda, sehingga agenda wisata maupun bisnis berjalan sesuai rencana."),
        pickup="Bandara YIA, Stasiun Tugu, dan hotel tempat Anda menginap",
        areas=["Yogyakarta", "Sleman", "Bantul", "Gunungkidul", "Kulon Progo", "Magelang"],
        destinations=[
            d("Malioboro & Titik Nol", "Pusat Kota", "Poros wisata utama Jogja: belanja, kuliner, dan bangunan kolonial dalam satu kawasan pedestrian."),
            d("Keraton & Tamansari", "Pusat Kota", "Kompleks istana Kesultanan Yogyakarta beserta bekas taman pemandian kerajaan."),
            d("Candi Prambanan", "Sleman", "Kompleks candi Hindu terbesar di Indonesia, situs warisan dunia UNESCO di sisi timur Jogja."),
            d("Candi Borobudur", "Magelang", "Candi Buddha terbesar di dunia, sekitar 1,5 jam dari pusat kota; paling nyaman berangkat pagi."),
            d("Pantai Parangtritis", "Bantul", "Pantai selatan legendaris dengan gumuk pasir Parangkusumo, sekitar satu jam dari pusat kota."),
            d("Pantai-pantai Gunungkidul", "Gunungkidul", "Deretan pantai berpasir putih lewat jalur perbukitan yang berkelok."),
        ],
        routes=[
            r("Borobudur (Magelang)", "±1,5 jam", "Paling nyaman berangkat pagi."),
            r("Solo", "±1,5–2 jam", "Bisa sekaligus mengunjungi Keraton Surakarta."),
            r("Semarang", "±3–3,5 jam", "Via Magelang atau lewat tol."),
            r("Pantai Gunungkidul", "±2 jam", "Rute berkelok menuju pantai selatan."),
        ],
        faq_extra=[q("Apakah bisa menjemput di Bandara YIA?", "Bisa. Bandara YIA berada di Kulon Progo, sekitar 1–1,5 jam dari pusat kota. Kirim nomor penerbangan saat memesan, driver menunggu di area kedatangan.")],
        en={
            "slug": {"_type": "slug", "current": "car-rental-yogyakarta"},
            "hero": {"eyebrow": "Yogyakarta, Central Java", "title": "Car rental in Yogyakarta", "titleAccent": "with a driver",
                     "lead": "Temples, the Sultan's palace and the south-coast beaches, with a driver who knows the way. Day tours, airport pick-ups and trips anywhere in Java."},
            "seo": {"title": "Car Rental in Yogyakarta with Driver | Arasya Rent Car",
                    "description": "Hire a car with a driver in Yogyakarta for Borobudur, Prambanan, Malioboro and the Gunungkidul beaches. Clear rates, book on WhatsApp."},
            "pickupPoints": "YIA airport, Tugu station, or your hotel",
            "areaServed": ["Yogyakarta", "Sleman", "Bantul", "Gunungkidul", "Kulon Progo", "Magelang"],
            "editorial": {
                "eyebrow": "About Yogyakarta", "title": "A special region with its sights spread wide",
                "lead": "Yogyakarta packs a royal palace, two World Heritage temples and a wild southern coastline into one region, and it is best seen by private car with a driver.",
                "body": [para("enjog1", "The distances between sights are long and the driving varies: winding roads up into the Gunungkidul hills, the busy Malioboro and palace quarter where parking is scarce, and a cross-country run to Borobudur in Magelang. Without a plan, the day disappears on the road."),
                         para("enjog2", "Arasya drivers put your visits in the right order, know which hours to avoid, and know the pick-up points at YIA airport, Tugu station and your hotel, so a sightseeing day or a business schedule runs as planned.")],
            },
            "destinations": [
                d("Malioboro & Kilometre Zero", "City centre", "Jogja's main street for shopping, street food and colonial buildings."),
                d("Kraton & Taman Sari", "City centre", "The Sultan's palace, with the old royal water gardens next door."),
                d("Prambanan", "Sleman", "Indonesia's largest Hindu temple complex, a UNESCO World Heritage site east of the city."),
                d("Borobudur", "Magelang", "The world's largest Buddhist temple, about 1.5 hours away; best with an early start."),
                d("Parangtritis Beach", "Bantul", "The famous south-coast beach and Parangkusumo sand dunes, about an hour from town."),
                d("Gunungkidul beaches", "Gunungkidul", "A string of white-sand bays reached by a winding road through the hills."),
            ],
            "routes": [
                r("Borobudur (Magelang)", "about 1.5 hrs", "Leave early for sunrise or the temple-climb slots."),
                r("Solo", "1.5–2 hrs", "Easy to combine with the Surakarta palace."),
                r("Semarang", "3–3.5 hrs", "Via Magelang or the toll road."),
                r("Gunungkidul beaches", "about 2 hrs", "A winding drive down to the south coast."),
            ],
            "faq": [
                q("Is the driver included in the price?", "Yes, always. You can choose 12 hours in town (fuel, tolls, parking and the driver's meals extra) or all-in (fuel, tolls and the driver's meals included)."),
                q("Can we do Borobudur and Prambanan in one day?", "Yes. With a 12-hour hire most visitors see Borobudur in the morning and Prambanan in the afternoon. Tell us your plans and we'll suggest a start time."),
                q("Can you pick me up at YIA airport?", "Yes. YIA is in Kulon Progo, about 1–1.5 hours from the city centre. Send your flight number and the driver will wait in arrivals."),
                q("Can we travel on to other cities?", "Yes, anywhere you like: Solo, Semarang, Dieng, or further. We quote the price before you go."),
                q("How do I pay?", "Once we send your invoice, you pay a 20% deposit into our official BCA account in the name of PT Ayomi Raya Karsa. The balance is paid to the driver when you meet, in cash or by transfer."),
            ],
        },
    ),
    city(
        "city-madiun", "Madiun", "MDN", "sewa-mobil-madiun", order=3, hero_car="car-toyota-avanza",
        eyebrow="Kota Madiun",
        lead="Untuk acara keluarga, kunjungan kerja, dan wisata ke Sarangan atau Ponorogo, serta perjalanan dari Madiun ke kota mana pun.",
        seo={"title": "Sewa Mobil Madiun dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Madiun untuk acara keluarga, kunjungan kerja, wisata Telaga Sarangan, dan perjalanan luar kota. Pesan via WhatsApp."},
        editorial=("Mengenal Madiun", "Kota pecel di simpang barat Jawa Timur",
                   "Madiun dikenal dengan nasi pecelnya dan menjadi simpul perjalanan di bagian barat Jawa Timur, dekat dengan Magetan, Ponorogo, dan Ngawi.",
                   "Banyak tamu kami datang untuk acara keluarga, kunjungan ke instansi, atau wisata ke Telaga Sarangan di lereng Gunung Lawu. Jalannya menanjak dan berkelok setelah keluar dari kota.",
                   "Dengan Tol Trans-Jawa, Madiun kini dekat dengan Solo dan Surabaya. Driver Arasya mengatur perjalanan harian maupun perjalanan panjang lintas provinsi."),
        pickup="Stasiun Madiun, pusat kota, dan hotel tempat Anda menginap",
        areas=["Madiun", "Magetan", "Ponorogo", "Ngawi"],
        destinations=[
            d("Pahlawan Street Center", "Pusat Kota", "Jalan utama dengan miniatur ikon dunia yang ramai dikunjungi keluarga di malam hari."),
            d("Telaga Sarangan", "Magetan", "Danau di lereng Gunung Lawu dengan udara sejuk, sekitar satu jam dari kota."),
            d("Ponorogo", "Ponorogo", "Kota asal kesenian Reog, dengan alun-alun dan kuliner sate khas."),
        ],
        routes=[
            r("Solo", "±1,5–2 jam", "Via Tol Trans-Jawa."),
            r("Surabaya", "±2,5–3 jam", "Via Tol Trans-Jawa."),
            r("Telaga Sarangan", "±1 jam", "Jalur menanjak ke lereng Gunung Lawu."),
        ],
        faq_extra=[q("Apakah bisa untuk acara keluarga beberapa hari?", "Bisa. Sampaikan tanggal dan agenda acara, admin menghitungkan tarif harian termasuk kebutuhan menginap driver bila ada.")],
    ),
    city(
        "city-surabaya", "Surabaya", "SUB", "sewa-mobil-surabaya", order=4, hero_car="car-toyota-zenix",
        eyebrow="Kota Surabaya",
        lead="Untuk perjalanan bisnis, antar-jemput Bandara Juanda, wisata ke Bromo dan Malang, serta perjalanan dari Surabaya ke kota mana pun.",
        seo={"title": "Sewa Mobil Surabaya dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Surabaya untuk bisnis, antar-jemput Bandara Juanda, wisata Bromo dan Malang, serta perjalanan luar kota. Pesan via WhatsApp."},
        editorial=("Mengenal Surabaya", "Kota Pahlawan dan pusat bisnis Jawa Timur",
                   "Surabaya adalah kota terbesar kedua di Indonesia dan pusat perdagangan Jawa Timur, dengan pelabuhan besar dan kawasan industri di sekitarnya.",
                   "Tamu kami biasanya datang untuk rapat dan kunjungan pabrik, lalu melanjutkan perjalanan ke Malang, Bromo, atau Madura. Lalu lintas dalam kota padat di jam kerja, dan Bandara Juanda berada di Sidoarjo, di luar kota.",
                   "Driver Arasya memilih jalur tol dan arteri yang tepat, dan terbiasa dengan perjalanan panjang dari Surabaya ke kawasan wisata di Jawa Timur."),
        pickup="Bandara Juanda, Stasiun Gubeng dan Pasar Turi, dan hotel tempat Anda menginap",
        areas=["Surabaya", "Sidoarjo", "Gresik", "Gerbangkertosusila"],
        destinations=[
            d("Tugu Pahlawan", "Surabaya Pusat", "Monumen dan museum peristiwa 10 November 1945."),
            d("House of Sampoerna", "Surabaya Utara", "Museum dan bangunan kolonial di kawasan kota tua."),
            d("Jembatan Suramadu", "Kenjeran", "Jembatan terpanjang di Indonesia yang menghubungkan Surabaya dengan Madura."),
            d("Kawasan Ampel", "Surabaya Utara", "Masjid bersejarah dan kawasan kuliner khas Arab di sekitarnya."),
        ],
        routes=[
            r("Malang", "±2 jam", "Via Tol Surabaya–Malang."),
            r("Bromo", "±3–4 jam", "Via Pasuruan, sebaiknya berangkat dini hari untuk sunrise."),
            r("Madura (Bangkalan)", "±1 jam", "Via Jembatan Suramadu."),
            r("Madiun", "±2,5–3 jam", "Via Tol Trans-Jawa."),
        ],
        faq_extra=[q("Apakah bisa menjemput di Bandara Juanda?", "Bisa. Kirim nomor penerbangan saat memesan, driver memantau jadwal pendaratan dan menunggu di area kedatangan.")],
    ),
    city(
        "city-malang", "Malang", "MLG", "sewa-mobil-malang", order=0, hero_car="car-toyota-fortuner",
        eyebrow="Malang & Batu",
        lead="Untuk wisata Batu dan Bromo, pantai selatan, acara kampus, serta perjalanan dari Malang ke kota mana pun.",
        seo={"title": "Sewa Mobil Malang dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Malang dan Batu untuk wisata keluarga, Bromo, pantai selatan, dan perjalanan luar kota. Pesan via WhatsApp."},
        editorial=("Mengenal Malang", "Kota sejuk dengan wisata di segala arah",
                   "Malang dan Kota Batu berada di dataran tinggi dengan udara sejuk, dikelilingi gunung dan taman wisata keluarga. Kota ini juga dikenal sebagai kota pelajar.",
                   "Tujuan wisatanya tersebar: Batu di barat, Bromo di timur, dan pantai-pantai selatan yang jalannya berkelok. Pada akhir pekan dan musim liburan, jalur menuju Batu sering padat.",
                   "Driver Arasya menyusun urutan kunjungan supaya tidak bolak-balik, dan tahu jam berangkat terbaik untuk menghindari antrean di kawasan wisata."),
        pickup="Bandara Abdul Rachman Saleh, Stasiun Malang, kawasan Batu, dan hotel tempat Anda menginap",
        areas=["Malang", "Batu", "Kabupaten Malang"],
        destinations=[
            d("Kota Batu", "Batu", "Taman wisata keluarga, museum, dan kebun apel di udara pegunungan."),
            d("Kampung Warna-Warni Jodipan", "Pusat Kota", "Kampung di tepi sungai dengan rumah-rumah berwarna cerah."),
            d("Coban Rondo", "Pujon", "Air terjun di kawasan hutan pinus di jalur menuju Batu."),
            d("Pantai selatan Malang", "Kabupaten Malang", "Deretan pantai karang dan pasir putih, sekitar dua jam lewat jalur berkelok."),
        ],
        routes=[
            r("Surabaya / Bandara Juanda", "±2 jam", "Via Tol Surabaya–Malang."),
            r("Batu", "±45–60 menit", "Lebih lama di akhir pekan."),
            r("Bromo", "±2–3 jam", "Via Tumpang, dilanjutkan jip lokal ke kawasan kawah."),
        ],
        faq_extra=[q("Apakah mobil bisa naik sampai ke Bromo?", "Mobil kami mengantar sampai titik penjemputan jip di Tumpang atau jalur lain yang diizinkan. Dari sana perjalanan ke kawah memakai jip lokal, lalu driver menunggu dan mengantar Anda kembali.")],
    ),
]

# International: car classes instead of the Indonesian fleet, quoted in rupiah.
INTL_TRUST = [
    {"title": "Driver lokal terverifikasi", "text": "Diseleksi dengan standar layanan Arasya."},
    {"title": "Admin berbahasa Indonesia", "text": "Pendampingan sejak pemesanan sampai perjalanan selesai."},
    {"title": "Penawaran dalam Rupiah", "text": "Harga tertulis dalam Rupiah, dibayar ke rekening resmi di Indonesia."},
    {"title": "Unit sesuai pesanan", "text": "Kelas dan kapasitas unit sesuai konfirmasi tertulis."},
]
INTL_UNITS = [
    {"name": "MPV 7 kursi", "seats": "6 penumpang + driver", "luggage": "3–4 koper kabin", "useCase": "Keluarga kecil, jemput bandara, dan tur harian dalam kota."},
    {"name": "MPV premium", "seats": "5 penumpang + driver", "luggage": "4 koper sedang", "useCase": "Perjalanan bisnis dan tamu yang ingin kursi kapten dan ruang kaki lega."},
    {"name": "Van 11–14 kursi", "seats": "10–13 penumpang + driver", "luggage": "Ruang di belakang baris terakhir", "useCase": "Rombongan kantor, grup wisata, dan jemput bandara bersama."},
]


def intl_faq(country, extra):
    return [
        q(f"Bagaimana cara memesan mobil dengan supir di {country}?", "Kirim tanggal, jumlah penumpang, penerbangan, dan rencana perjalanan lewat WhatsApp. Admin kami mengirim penawaran tertulis dalam Rupiah sebelum Anda membayar."),
        q("Apakah pembayaran dalam Rupiah?", "Ya. Penawaran dan pembayaran dilakukan dalam Rupiah ke rekening resmi BCA a.n. PT Ayomi Raya Karsa, sehingga Anda tidak perlu menghitung kurs sendiri."),
        *extra,
        q("Apakah bisa sewa beberapa hari lintas kota?", f"Bisa. Satu mobil dan supir bisa mendampingi Anda selama beberapa hari, termasuk perjalanan ke kota lain di {country}. Sampaikan itinerari Anda agar admin menghitungkan penawarannya."),
    ]


INTL = [
    city(
        "city-singapura", "Singapura", "SIN", "sewa-mobil-singapura", order=1, country="INTL", pricing="quote", hero_car="car-toyota-alphard",
        eyebrow="Singapura",
        lead="Mobil pribadi dengan supir untuk wisatawan Indonesia: jemput Bandara Changi, keliling kota, sampai lintas batas ke Johor, dengan admin berbahasa Indonesia.",
        seo={"title": "Sewa Mobil Singapura dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Singapura untuk wisatawan Indonesia. Jemput Bandara Changi, city tour, dan lintas batas ke Johor. Penawaran dalam Rupiah."},
        editorial=("Mengenal Singapura", "Kota-negara yang rapi, padat aturan, dan cepat dijelajahi",
                   "Luasnya hanya sekitar 730 kilometer persegi, tetapi Singapura menuntut perencanaan: biaya jalan elektronik berubah menurut jam, dan ruang parkir di pusat kota terbatas.",
                   "Sistem ERP menaikkan biaya masuk kawasan tertentu pada jam sibuk, sementara gedung di Orchard dan Marina menerapkan tarif parkir progresif. Bagi keluarga atau tamu yang mengejar jadwal rapat, hal seperti ini mudah mengganggu ritme perjalanan.",
                   "Supir yang mendampingi Anda memahami peta tarif dan pola lalu lintas kota ini. Anda cukup menyebutkan tujuan berikutnya, termasuk bila perjalanan berlanjut ke Johor."),
        pickup="Bandara Changi, Terminal Feri HarbourFront, dan hotel tempat Anda menginap",
        areas=["Singapura", "Marina Bay", "Sentosa", "Orchard", "Changi"],
        destinations=[
            d("Marina Bay Sands & Gardens by the Bay", "Marina Bay", "Kawasan tepi teluk dengan taman futuristik, dek observasi, dan pertunjukan cahaya setiap malam."),
            d("Pulau Sentosa", "Sentosa", "Universal Studios, akuarium, dan pantai dalam satu pulau resor yang bisa dijangkau dengan mobil."),
            d("Orchard Road", "Orchard", "Koridor belanja sepanjang dua kilometer dengan pusat perbelanjaan yang saling terhubung."),
            d("Jewel Changi Airport", "Changi", "Air terjun dalam ruangan dan taman berlapis yang menyatu dengan terminal bandara."),
        ],
        routes=[
            r("Johor Bahru", "±1–2 jam", "Via Woodlands atau Tuas, tergantung antrean imigrasi."),
            r("Legoland Malaysia", "±1,5 jam", "Tujuan keluarga tidak jauh setelah perbatasan Tuas."),
            r("Malaka", "±3,5 jam", "Kota warisan dunia, paling nyaman sebagai perjalanan menginap."),
        ],
        faq_extra=intl_faq("Singapura", [
            q("Apakah mobil bisa menyeberang ke Malaysia?", "Perjalanan lintas batas ke Johor Bahru dan kota lain di Malaysia bisa diatur beserta dokumen kendaraannya. Sampaikan tanggal dan tujuan Anda agar ketersediaannya dikonfirmasi lebih dahulu."),
            q("Apakah biaya ERP dan parkir sudah termasuk?", "Rincian biaya jalan elektronik dan parkir dicantumkan dalam penawaran tertulis sebelum perjalanan, sehingga tidak ada tambahan di tengah jalan."),
        ]),
        unitClasses=INTL_UNITS, trust=INTL_TRUST,
    ),
    city(
        "city-malaysia", "Malaysia", "MYS", "sewa-mobil-malaysia", order=2, country="INTL", pricing="quote", hero_car="car-toyota-zenix",
        eyebrow="Kuala Lumpur & sekitarnya",
        lead="Mobil pribadi dengan supir untuk wisatawan Indonesia: Kuala Lumpur, Genting, Malaka, sampai Penang, dengan admin berbahasa Indonesia.",
        seo={"title": "Sewa Mobil Malaysia dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Malaysia untuk wisatawan Indonesia. Kuala Lumpur, Genting, Malaka, dan Penang. Penawaran dalam Rupiah, pesan via WhatsApp."},
        editorial=("Mengenal Malaysia", "Negeri serumpun yang tujuannya tersebar",
                   "Malaysia terasa akrab bagi wisatawan Indonesia, dengan bahasa serumpun dan kuliner yang familiar, tetapi destinasi terbaiknya tersebar antar kota dan dataran tinggi.",
                   "Genting dan Cameron Highlands berarti jalan pegunungan, sementara Malaka dan Penang berjarak ratusan kilometer dari ibu kota. Kereta dan bus memakan waktu dan membatasi bawaan keluarga.",
                   "Dengan supir Arasya, itinerari lintas kota tersusun efisien: satu mobil sejak penjemputan di KLIA, dengan koordinasi admin dalam Bahasa Indonesia."),
        pickup="KLIA 1 & 2, KL Sentral, dan hotel tempat Anda menginap",
        areas=["Kuala Lumpur", "Selangor", "Genting", "Malaka", "Penang"],
        destinations=[
            d("Menara Petronas & KLCC", "Kuala Lumpur", "Ikon kota dengan taman dan pusat perbelanjaan di sekitarnya."),
            d("Batu Caves", "Selangor", "Kuil gua Hindu dengan tangga warna-warni yang ikonik."),
            d("Genting Highlands", "Pahang", "Resor dataran tinggi dengan taman hiburan dan udara sejuk."),
            d("Kota Tua Malaka", "Malaka", "Jonker Street dan bangunan kolonial di situs warisan dunia."),
        ],
        routes=[
            r("Kuala Lumpur → Genting Highlands", "±1 jam", "Berangkat pagi untuk menghindari kabut sore."),
            r("Kuala Lumpur → Malaka", "±2 jam", "Nyaman untuk perjalanan sehari."),
            r("Kuala Lumpur → Penang", "±4 jam", "Ideal menginap satu malam di George Town."),
        ],
        faq_extra=intl_faq("Malaysia", [
            q("Apakah komunikasi dengan supir mudah?", "Ya. Admin kami berbahasa Indonesia, dan sebagian besar supir di Malaysia memahami Bahasa Melayu yang serumpun dengan Bahasa Indonesia."),
        ]),
        unitClasses=INTL_UNITS, trust=INTL_TRUST,
    ),
    city(
        "city-thailand", "Thailand", "THA", "sewa-mobil-thailand", order=3, country="INTL", pricing="quote", hero_car="car-toyota-hiace-premio",
        eyebrow="Bangkok & sekitarnya",
        lead="Mobil pribadi dengan supir untuk wisatawan Indonesia di Thailand: dari Bangkok ke Pattaya, Ayutthaya, dan kota lain, dengan admin berbahasa Indonesia.",
        seo={"title": "Sewa Mobil Thailand (Bangkok) dengan Supir — Arasya Rent Car", "description": "Sewa mobil dengan supir di Bangkok untuk wisatawan Indonesia. Pattaya, Ayutthaya, Hua Hin, dan rute antar kota. Penawaran dalam Rupiah."},
        editorial=("Mengenal Thailand", "Negeri Gajah Putih untuk wisatawan Indonesia",
                   "Thailand adalah salah satu tujuan luar negeri favorit wisatawan Indonesia: penerbangannya singkat, tetapi bahasa dan transportasi antar kota sering menyulitkan keluarga.",
                   "Transportasi umum Bangkok tidak praktis untuk menuju Damnoen Saduak, Ayutthaya, atau Pattaya, dan taksi antar kota berarti menawar harga dalam bahasa Thai.",
                   "Dengan Arasya, satu mobil dan supir yang sama mendampingi Anda sejak mendarat sampai kembali ke bandara, dengan koordinasi admin dalam Bahasa Indonesia."),
        pickup="Bandara Suvarnabhumi, Bandara Don Mueang, dan hotel tempat Anda menginap",
        areas=["Bangkok", "Pattaya", "Ayutthaya", "Hua Hin"],
        destinations=[
            d("Grand Palace & Wat Arun", "Bangkok", "Ikon kerajaan Thailand di tepi Sungai Chao Phraya."),
            d("Damnoen Saduak", "Ratchaburi", "Pasar terapung legendaris, paling ramai di pagi hari."),
            d("Kota Tua Ayutthaya", "Ayutthaya", "Reruntuhan ibu kota Kerajaan Siam, situs warisan dunia UNESCO."),
            d("Pattaya", "Chonburi", "Kota pantai dengan taman hiburan dan wisata keluarga."),
        ],
        routes=[
            r("Bangkok → Pattaya", "±2 jam", "Kota pantai populer di tepi Teluk Thailand."),
            r("Bangkok → Ayutthaya", "±1,5 jam", "Bekas ibu kota Kerajaan Siam."),
            r("Bangkok → Hua Hin", "±3 jam", "Kota resor tepi laut favorit keluarga."),
        ],
        faq_extra=intl_faq("Thailand", [
            q("Apakah supir di Thailand bisa berbahasa Indonesia?", "Koordinasi pemesanan dilakukan admin kami dalam Bahasa Indonesia. Supir lokal berkomunikasi dalam bahasa Inggris dasar, dan admin siap membantu selama perjalanan."),
        ]),
        unitClasses=INTL_UNITS, trust=INTL_TRUST,
    ),
]

ALL = CITIES + INTL


# Copy that tied a page to a few named destinations. Each fix is applied only
# while the field still holds the old text, so Studio edits are never lost.
FIXES = [
    ("city-bogor", ["hero", "lead"], "Layanan sewa mobil premium dengan supir profesional untuk perjalanan bisnis, wisata, dan keluarga — melayani Bogor, Puncak, dan rute luar kota.",
     "Sewa mobil dengan supir profesional untuk perjalanan bisnis, wisata, dan keluarga, di dalam Bogor maupun dari Bogor ke kota mana pun."),
    ("city-bogor", ["seo", "description"], "Sewa mobil premium dengan supir profesional di Bogor. Tarif transparan Dalam Kota 12 jam atau All-in, melayani Bogor, Puncak, dan rute luar kota. Pesan via WhatsApp.",
     "Sewa mobil dengan supir profesional di Bogor. Tarif Dalam Kota 12 jam atau All-in, untuk Puncak, bandara, dan perjalanan ke kota mana pun. Pesan via WhatsApp."),
    ("city-bogor", ["faq", {"_key": "k00017"}], None,
     {"question": "Apakah bisa ke luar kota dari Bogor?", "answer": "Bisa. Dari Bogor kami melayani perjalanan ke kota mana pun, dalam provinsi maupun antarprovinsi, termasuk sewa beberapa hari. Tarif disesuaikan dengan jarak dan durasi, dan dikonfirmasi tertulis sebelum berangkat."}),
    ("city-jakarta", ["hero", "lead"], "Untuk meeting, antar-jemput bandara, dan perjalanan keluarga di Jakarta, serta rute ke Bogor, Puncak, dan Bandung.",
     "Untuk meeting, antar-jemput bandara, dan perjalanan keluarga di Jakarta, serta perjalanan dari Jakarta ke kota mana pun."),
    ("city-jakarta", ["seo", "description"], "Sewa mobil dengan supir di Jakarta untuk meeting, antar-jemput bandara, dan perjalanan keluarga. Tarif Dalam Kota 12 jam atau All-in, rute ke Bogor, Puncak, dan Bandung. Pesan via WhatsApp.",
     "Sewa mobil dengan supir di Jakarta untuk meeting, antar-jemput bandara, dan perjalanan keluarga. Tarif Dalam Kota 12 jam atau All-in, ke luar kota ke mana pun. Pesan via WhatsApp."),
    ("city-jakarta", ["faq", {"_key": "k00051"}], None,
     {"question": "Apakah bisa ke luar kota dari Jakarta?", "answer": "Bisa. Dari Jakarta kami melayani perjalanan ke kota mana pun, dalam provinsi maupun antarprovinsi, termasuk sewa beberapa hari. Tarif disesuaikan dengan jarak dan durasi, dan dikonfirmasi tertulis sebelum berangkat."}),
    ("city-bandung", ["hero", "lead"], "Untuk wisata Lembang dan Ciwidey, perjalanan bisnis di Bandung, serta rute ke Jakarta dan Bogor.",
     "Untuk wisata Lembang dan Ciwidey, perjalanan bisnis di Bandung, serta perjalanan dari Bandung ke kota mana pun."),
    ("city-bandung", ["seo", "description"], "Sewa mobil dengan supir di Bandung untuk wisata Lembang dan Ciwidey, perjalanan bisnis, dan rute ke Jakarta atau Bogor. Tarif Dalam Kota 12 jam atau All-in. Pesan via WhatsApp.",
     "Sewa mobil dengan supir di Bandung untuk wisata Lembang dan Ciwidey, perjalanan bisnis, dan perjalanan ke kota mana pun. Tarif Dalam Kota 12 jam atau All-in. Pesan via WhatsApp."),
    ("city-bandung", ["faq", {"_key": "k00071"}], None,
     {"question": "Apakah bisa ke luar kota dari Bandung?", "answer": "Bisa. Dari Bandung kami melayani perjalanan ke kota mana pun, dalam provinsi maupun antarprovinsi, termasuk sewa beberapa hari. Tarif disesuaikan dengan jarak dan durasi, dan dikonfirmasi tertulis sebelum berangkat."}),
    ("homePage", ["hero", "lead"], "Dari Avanza sampai Hiace. Untuk harian, ke Puncak, bandara, atau luar kota.",
     "Dari MPV keluarga sampai van rombongan. Untuk harian, antar-jemput bandara, atau perjalanan ke kota mana pun."),
    ("homePage", ["seo", "description"], "Rental mobil dengan driver: Avanza, Innova, Fortuner sampai Hiace. Tarif 12 jam mulai Rp500.000 atau paket all-in. Melayani Bogor, Jakarta, dan Bandung. Pesan lewat WhatsApp, admin 24 jam.",
     "Rental mobil dengan driver: Avanza, Innova, Fortuner sampai Hiace. Tarif 12 jam mulai Rp500.000 atau paket all-in. Melayani berbagai kota di Indonesia hingga Singapura, Malaysia, dan Thailand. Admin 24 jam."),
    ("service-travel", ["answer"], "Travel carter Arasya adalah layanan satu mobil dengan driver untuk rombongan Anda sendiri, dijemput dan diantar sampai alamat tujuan. Tersedia rute dari Bogor, Jakarta, dan Bandung ke Bandara Soekarno-Hatta, Bandung, Garut, Serang, dan kota lain, dengan tarif mulai Rp500.000 per mobil.",
     "Travel carter Arasya adalah layanan satu mobil dengan driver untuk rombongan Anda sendiri, dijemput dan diantar sampai alamat tujuan, ke kota mana pun. Tarif rute populer tercantum di bawah, mulai Rp500.000 per mobil; rute lain dihitungkan admin lewat WhatsApp."),
    ("service-travel", ["faq", {"_key": "k00169"}], None,
     {"question": "Rute apa saja yang tersedia?", "answer": "Kami melayani carter ke kota mana pun, antar kota maupun antarprovinsi. Tabel di halaman ini berisi tarif rute yang paling sering dipesan; untuk rute lain, kirim kota asal dan tujuan lewat WhatsApp dan admin kami hitungkan tarifnya."}),
    ("service-travel", ["seo", "description"], "Carter mobil door to door dari Bogor, Jakarta, dan Bandung ke bandara dan antar kota. Satu mobil untuk rombongan Anda sendiri. Cek tarif per unit, pesan lewat WhatsApp.",
     "Carter mobil door to door ke bandara dan antar kota, ke mana pun tujuan Anda. Satu mobil untuk rombongan Anda sendiri. Cek tarif rute populer, pesan lewat WhatsApp."),
    ("service-korporat", ["answer"], "Arasya Rent Car melayani sewa mobil dengan driver untuk perusahaan di Bogor, Jakarta, dan Bandung, dikelola oleh PT Ayomi Raya Karsa. Tersedia unit MPV, SUV, hingga van rombongan, dengan pembayaran ke rekening resmi perusahaan dan admin yang siaga 24 jam.",
     "Arasya Rent Car melayani sewa mobil dengan driver untuk perusahaan di berbagai kota di Indonesia, dikelola oleh PT Ayomi Raya Karsa. Tersedia unit MPV, SUV, hingga van rombongan, untuk perjalanan dalam kota maupun ke kota mana pun, dengan pembayaran ke rekening resmi perusahaan dan admin yang siaga 24 jam."),
    ("service-korporat", ["seo", "description"], "Transportasi karyawan dan tamu bisnis di Bogor, Jakarta, dan Bandung. Innova, Fortuner, Hiace dengan driver, pembayaran ke rekening PT Ayomi Raya Karsa, admin 24 jam. Minta penawaran lewat WhatsApp.",
     "Transportasi karyawan dan tamu bisnis di berbagai kota di Indonesia. Innova, Fortuner, Hiace dengan driver, pembayaran ke rekening PT Ayomi Raya Karsa, admin 24 jam. Minta penawaran lewat WhatsApp."),
    ("service-wedding", ["answer"], "Arasya Rent Car menyediakan mobil pengantin dengan driver di Bogor, Jakarta, dan Bandung, dengan pilihan unit Toyota Alphard, Toyota Zenix Q Hybrid Modellista, dan Toyota Fortuner. Pemesanan melalui WhatsApp; unit, jam, dan titik jemput dikonfirmasi sebelum hari acara.",
     "Arasya Rent Car menyediakan mobil pengantin dengan driver di berbagai kota, dengan pilihan unit seperti Toyota Alphard, Toyota Zenix Q Hybrid Modellista, dan Toyota Fortuner. Pemesanan melalui WhatsApp; unit, jam, dan titik jemput dikonfirmasi sebelum hari acara."),
]

# English documents: the same fixes, for the /en pages.
EN_FIXES = [
    ("city-bandung", ["en", "hero", "lead"], "For day trips to Lembang and Ciwidey, business in the city, and transfers to Jakarta and Bogor.",
     "For day trips to Lembang and Ciwidey, business in the city, and trips from Bandung to anywhere you need to go."),
    ("city-bandung", ["en", "seo", "description"], "Hire a car with a driver in Bandung for Lembang and Ciwidey day trips, business travel, and transfers to Jakarta or Bogor. Book on WhatsApp.",
     "Hire a car with a driver in Bandung for Lembang and Ciwidey day trips, business travel, and trips to any city. Book on WhatsApp."),
    ("city-jakarta", ["en", "hero", "lead"], "For meetings, airport transfers and family days out in Jakarta, and trips to Bogor, Puncak and Bandung.",
     "For meetings, airport transfers and family days out in Jakarta, and trips from Jakarta to anywhere in Java."),
    ("city-jakarta", ["en", "seo", "description"], "Hire a car with a driver in Jakarta for meetings, airport transfers and day trips. 12-hour or all-in rates, trips to Bogor, Puncak and Bandung. Book on WhatsApp.",
     "Hire a car with a driver in Jakarta for meetings, airport transfers and day trips. 12-hour or all-in rates, and trips to any city. Book on WhatsApp."),
    ("service-travel", ["en", "answer"], "A private transfer is a car and driver for your group only, from your address to your destination. We run from Bogor, Jakarta and Bandung to Soekarno-Hatta Airport, Bandung, Garut, Serang and more, from Rp500,000 per car.",
     "A private transfer is a car and driver for your group only, from your address to wherever you are going. Popular routes are priced below from Rp500,000 per car; for anywhere else, send us your route on WhatsApp for a quote."),
    ("service-travel", ["en", "faq", 2], None,
     {"question": "Which routes do you cover?", "answer": "Anywhere you need to go, between cities or across provinces. The table shows our most-booked routes; for any other trip, send us your start and end point on WhatsApp and we'll quote a price."}),
    ("service-travel", ["en", "seo", "description"], "Door-to-door private car transfers from Bogor, Jakarta and Bandung to Soekarno-Hatta Airport and other cities. Priced per car, driver included.",
     "Door-to-door private car transfers to the airport and between cities, wherever you are going. Priced per car, driver included."),
    ("service-korporat", ["en", "answer"], "Yes. Arasya Rent Car provides cars with drivers for companies in Bogor, Jakarta and Bandung, and is operated by PT Ayomi Raya Karsa. We have MPVs, SUVs and group vans, invoice in the company's name, and answer on WhatsApp 24 hours a day.",
     "Yes. Arasya Rent Car provides cars with drivers for companies in cities across Indonesia, and is operated by PT Ayomi Raya Karsa. We have MPVs, SUVs and group vans for local and intercity trips, invoice in the company's name, and answer on WhatsApp 24 hours a day."),
    ("service-korporat", ["en", "seo", "description"], "Cars and drivers for companies in Bogor, Jakarta and Bandung: airport pick-ups, meetings and staff transport. Invoiced by PT Ayomi Raya Karsa.",
     "Cars and drivers for companies across Indonesia: airport pick-ups, meetings, staff transport and intercity trips. Invoiced by PT Ayomi Raya Karsa."),
    ("homePage", ["en", "hero", "lead"], "From a seven-seater to a 14-seat van. Day hire, airport transfers, and trips to Puncak, Bandung and beyond.",
     "From family seven-seaters to group vans. Day hire, airport transfers, and trips to anywhere you need to go."),
    ("homePage", ["en", "seo", "description"], "Rent a car with a professional driver: Avanza, Innova, Fortuner, Alphard or Hiace. 12-hour rates from Rp500,000 or all-in packages. Book on WhatsApp.",
     "Rent a car with a professional driver in cities across Indonesia: Avanza, Innova, Fortuner, Alphard or Hiace. 12-hour rates from Rp500,000 or all-in packages. Book on WhatsApp."),
]
