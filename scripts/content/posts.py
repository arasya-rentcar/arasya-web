"""New blog articles. Written in a light markup that becomes Portable Text:

    ## Heading        -> h2
    - item            -> bullet
    plain paragraph   -> normal block, with [text](/path) links

Dates in the future are scheduled: the site hides them until that day and
the daily "Publish scheduled posts" workflow rebuilds the site on the day.
"""
import re

LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def blocks(md, key):
    out = []
    for i, raw in enumerate(md.strip().split("\n")):
        line = raw.strip()
        if not line:
            continue
        style, item = "normal", None
        if line.startswith("## "):
            style, line = "h2", line[3:]
        elif line.startswith("- "):
            item, line = "bullet", line[2:]
        k = f"{key}b{i}"
        children, defs, pos, n = [], [], 0, 0
        for m in LINK.finditer(line):
            if m.start() > pos:
                children.append({"_type": "span", "_key": f"{k}s{n}", "text": line[pos:m.start()], "marks": []}); n += 1
            dk = f"{k}l{n}"
            defs.append({"_type": "link", "_key": dk, "href": m.group(2)})
            children.append({"_type": "span", "_key": f"{k}s{n}", "text": m.group(1), "marks": [dk]}); n += 1
            pos = m.end()
        if pos < len(line) or not children:
            children.append({"_type": "span", "_key": f"{k}s{n}", "text": line[pos:], "marks": []})
        b = {"_type": "block", "_key": k, "style": style, "markDefs": defs, "children": children}
        if item:
            b["listItem"], b["level"] = item, 1
        out.append(b)
    return out


def q(question, answer):
    return {"question": question, "answer": answer}


POSTS = [
    {
        "key": "biaya-sewa-mobil-dengan-driver",
        "title": "Rincian biaya sewa mobil dengan driver: tarif 12 jam atau all-in?",
        "category": "Panduan",
        "publishedAt": "2026-09-28",
        "excerpt": "Tarif 12 jam dalam kota hanya mencakup mobil dan driver; BBM, tol, parkir, dan makan driver dibayar terpisah. Paket all-in sudah mencakup semuanya. Untuk perjalanan jauh atau lewat tol, all-in biasanya lebih praktis.",
        "seo": {"title": "Biaya Sewa Mobil dengan Driver: Tarif 12 Jam vs All-in", "description": "Apa saja yang termasuk tarif sewa mobil dengan driver? Bedanya tarif 12 jam dalam kota dan paket all-in, biaya tambahan, dan cara memilih yang paling hemat."},
        "body": """
Saat menyewa mobil dengan driver, pertanyaan pertama biasanya sama: harga yang tertera itu sudah termasuk apa saja? Di Arasya ada dua jenis tarif, dan memilih yang tepat bisa membuat biaya perjalanan jauh lebih mudah diperkirakan.
## Tarif dalam kota 12 jam
Tarif ini mencakup mobil dan jasa driver selama 12 jam. Biaya perjalanan lain dibayar terpisah selama perjalanan:
- BBM, sesuai pemakaian
- Tol dan parkir
- Makan driver
Tarif 12 jam cocok untuk keperluan dalam kota: meeting di beberapa lokasi, belanja, atau antar-jemput keluarga. Karena jaraknya pendek, biaya BBM dan tol biasanya kecil.
## Paket all-in
Paket all-in sudah mencakup BBM, tol, dan makan driver. Anda tidak perlu menyiapkan uang tunai untuk tol atau mengisi bensin di tengah jalan, dan total biaya sudah jelas sejak awal.
Paket ini paling pas untuk perjalanan luar kota, misalnya ke Puncak, Bandung, atau bandara, karena porsi BBM dan tolnya besar.
## Biaya yang perlu ditanyakan sejak awal
- Kelebihan jam: bila pemakaian lebih dari 12 jam, ada biaya tambahan per jam yang dikonfirmasi tertulis sebelum perjalanan.
- Menginap: untuk perjalanan lebih dari satu hari, tanyakan biaya penginapan dan makan driver.
- Rute khusus: tujuan di luar kota layanan dihitung sesuai jarak dan durasi.
## Cara memilih
Bila sebagian besar waktu dihabiskan di dalam kota, pilih tarif 12 jam. Bila perjalanan melewati tol jauh atau ke luar kota, pilih all-in. Kalau ragu, kirim rencana perjalanan lewat WhatsApp; admin kami akan menghitungkan pilihan yang paling hemat.
Daftar tarif lengkap setiap unit ada di halaman [armada & tarif](/armada).
""",
        "faq": [
            q("Apakah tarif sewa mobil sudah termasuk driver?", "Ya. Semua tarif Arasya sudah termasuk jasa driver, baik tarif 12 jam dalam kota maupun paket all-in."),
            q("Apa bedanya tarif 12 jam dan all-in?", "Tarif 12 jam hanya mencakup mobil dan driver; BBM, tol, parkir, dan makan driver dibayar terpisah. All-in sudah mencakup BBM, tol, dan makan driver."),
        ],
    },
    {
        "key": "memilih-mobil-untuk-rombongan",
        "title": "Memilih mobil untuk rombongan: Avanza, Innova, Hiace, atau Elf?",
        "category": "Panduan",
        "publishedAt": "2026-09-28",
        "excerpt": "Untuk 4 penumpang, MPV seperti Avanza atau Xpander sudah cukup. Rombongan 5–6 orang dewasa dengan koper lebih nyaman di Innova. Di atas itu, satu Hiace atau Elf biasanya lebih hemat daripada dua atau tiga mobil kecil.",
        "seo": {"title": "Memilih Mobil untuk Rombongan: Avanza, Innova, Hiace, Elf", "description": "Panduan memilih mobil sesuai jumlah penumpang dan bawaan: kapan cukup Avanza, kapan perlu Innova, dan kapan lebih hemat pakai Hiace atau Elf."},
        "body": """
Jumlah kursi bukan satu-satunya patokan. Yang sering terlupa adalah bawaan dan lama perjalanan: enam orang dewasa dengan koper untuk perjalanan tiga jam butuh mobil yang berbeda dari enam orang yang hanya keliling kota.
## 1–4 penumpang
MPV tujuh kursi seperti [Toyota Avanza](/armada/toyota-avanza) atau [Mitsubishi Xpander](/armada/mitsubishi-xpander) sudah lega. Baris ketiga bisa dilipat untuk koper. Untuk perjalanan luar kota yang panjang, Xpander terasa lebih empuk.
## 5–6 penumpang
Di sini [Toyota Innova Reborn](/armada/toyota-innova-reborn) jadi pilihan paling aman. Baris ketiganya tetap nyaman untuk orang dewasa dan bagasinya muat beberapa koper. Bila menjamu tamu penting, [Innova Zenix](/armada/toyota-zenix) lebih senyap dan modern.
## 7–13 penumpang
Satu [Toyota Hiace](/armada/toyota-hiace-commuter) biasanya lebih hemat daripada dua MPV, dan seluruh rombongan berangkat serta tiba bersama. Perhatikan bawaan: bila semua kursi terisi, ruang koper terbatas.
## Rombongan besar
Untuk satu divisi kantor atau rombongan keluarga besar, [Isuzu Elf Long](/armada/isuzu-elf-long) membawa hampir dua puluh orang dalam satu kendaraan. Sampaikan alamat tujuan saat memesan, karena kendaraan panjang perlu jalan dan tempat parkir yang cukup.
## Tips singkat
- Hitung koper, bukan hanya orang. Satu koper besar kira-kira memakan ruang satu kursi.
- Untuk perjalanan lebih dari tiga jam, pilih satu tingkat lebih lega dari kebutuhan minimum.
- Anak-anak lebih nyaman di baris ketiga; orang tua di baris kedua.
Masih ragu? Kirim jumlah penumpang, bawaan, dan tujuan lewat WhatsApp, admin kami bantu pilihkan. Semua unit bisa dibandingkan di halaman [armada](/armada).
""",
        "faq": [
            q("Mobil apa yang cocok untuk 6 orang dewasa dengan koper?", "Toyota Innova Reborn atau Innova Zenix. Baris ketiganya nyaman untuk orang dewasa dan bagasinya muat beberapa koper."),
            q("Lebih hemat sewa Hiace atau dua mobil?", "Untuk 7–13 penumpang, satu Hiace dengan satu driver biasanya lebih hemat daripada dua MPV, dan rombongan tidak terpisah."),
        ],
    },
    {
        "key": "cara-menghindari-penipuan-rental-mobil",
        "title": "Cara menghindari penipuan saat menyewa mobil",
        "category": "Tips",
        "publishedAt": "2026-09-28",
        "excerpt": "Penipuan rental biasanya memakai nama perusahaan asli dengan nomor dan rekening palsu. Pastikan chat datang dari nomor resmi, nama penerima transfer adalah nama perusahaan, dan Anda menerima invoice sebelum membayar DP.",
        "seo": {"title": "Cara Menghindari Penipuan Rental Mobil", "description": "Modus penipuan rental mobil yang sering terjadi dan cara mengeceknya: nomor resmi, nama rekening perusahaan, invoice, dan tanda bahaya yang perlu diwaspadai."},
        "body": """
Penipuan yang mengatasnamakan rental mobil umumnya tidak rumit. Pelaku memakai nama dan foto dari perusahaan asli, lalu meminta DP ke rekening pribadi. Setelah uang masuk, nomornya menghilang.
## Modus yang sering dipakai
- Akun media sosial atau iklan palsu dengan nama yang mirip.
- Harga jauh lebih murah dari biasanya, dengan alasan "promo terbatas".
- Desakan untuk segera transfer supaya unit "tidak diambil orang lain".
- Rekening atas nama perorangan, dengan alasan rekening perusahaan "sedang bermasalah".
## Tiga hal yang perlu dicek
- Nomor: pastikan chat datang dari nomor resmi yang tercantum di situs perusahaan.
- Rekening: nama penerima di aplikasi bank harus nama perusahaan, bukan nama orang.
- Invoice: minta invoice resmi sebelum membayar DP.
## Nomor dan rekening resmi Arasya
Arasya Rent Car dikelola PT Ayomi Raya Karsa. Pembayaran hanya ke rekening atas nama perusahaan, dan kami tidak pernah meminta kode OTP atau PIN. Daftar nomor dan rekening resmi, lengkap dengan tombol salin, ada di halaman [nomor & rekening resmi](/rekening-resmi).
## Kalau sudah terlanjur transfer
Segera hubungi bank Anda untuk meminta pemblokiran, simpan semua bukti percakapan dan transfer, lalu laporkan ke kepolisian. Bila penipu memakai nama Arasya, kabari kami lewat nomor resmi supaya bisa ikut kami laporkan.
""",
        "faq": [
            q("Bagaimana cara memastikan rekening rental mobil asli?", "Cek nama penerima di aplikasi bank sebelum transfer. Rekening resmi rental berbadan usaha atas nama perusahaan, bukan perorangan."),
            q("Apa yang harus dilakukan bila sudah transfer ke penipu?", "Hubungi bank untuk meminta pemblokiran, simpan bukti percakapan dan transfer, lalu laporkan ke kepolisian."),
        ],
    },
    {
        "key": "itinerari-bandung-satu-hari",
        "title": "Itinerari satu hari di Bandung: Lembang atau Ciwidey?",
        "category": "Itinerari",
        "city": "city-bandung",
        "publishedAt": "2026-10-01",
        "coverPath": None,
        "excerpt": "Dalam 12 jam, pilih salah satu: Lembang di utara (Tangkuban Parahu, kebun, dan kuliner) atau Ciwidey di selatan (Kawah Putih dan kebun teh). Menggabungkan keduanya dalam sehari membuat banyak waktu habis di jalan.",
        "seo": {"title": "Itinerari 1 Hari di Bandung: Lembang atau Ciwidey", "description": "Rencana perjalanan sehari di Bandung dengan mobil dan driver: rute Lembang atau Ciwidey, jam berangkat terbaik, dan tips menghindari macet akhir pekan."},
        "body": """
Tempat wisata terbaik Bandung ada di pinggir kota, dan jalannya menanjak serta padat di akhir pekan. Karena itu, kunci sehari yang menyenangkan adalah memilih satu arah saja: utara ke Lembang, atau selatan ke Ciwidey.
## Pilihan 1: Lembang
- Berangkat sekitar pukul 07.00 supaya tiba di Tangkuban Parahu sebelum ramai.
- Setelah kawah, turun ke kawasan Lembang untuk makan siang dan mampir ke kebun atau tempat wisata keluarga.
- Sore hari kembali ke kota dan tutup hari di Jalan Braga.
## Pilihan 2: Ciwidey
- Berangkat lebih pagi, sekitar pukul 06.00, karena jaraknya lebih jauh dari pusat kota.
- Kawah Putih paling indah di pagi hari saat kabut belum turun.
- Lanjutkan ke kebun teh dan danau di sekitar Rancabali, lalu makan siang di sepanjang jalur Ciwidey.
## Kenapa tidak dua-duanya?
Lembang dan Ciwidey berada di sisi kota yang berlawanan. Menggabungkannya berarti melintasi Bandung di jam padat, dan waktu di jalan bisa lebih lama dari waktu di tempat wisata.
## Tips
- Hindari Sabtu siang bila memungkinkan; antrean menuju Lembang bisa sangat panjang.
- Bawa jaket; suhu di Tangkuban Parahu dan Kawah Putih jauh lebih dingin dari kota.
- Sewa 12 jam biasanya cukup untuk salah satu rute. Sampaikan daftar tujuan Anda, driver akan menyusun urutannya.
Tarif dan unit untuk Bandung ada di halaman [sewa mobil Bandung](/sewa-mobil-bandung). Datang dari Jakarta? Lihat juga [travel Jakarta–Bandung](/travel/jakarta-bandung).
""",
        "faq": [
            q("Apakah Lembang dan Ciwidey bisa dikunjungi dalam sehari?", "Bisa, tetapi tidak disarankan. Keduanya berada di sisi kota yang berlawanan, sehingga banyak waktu habis di jalan."),
            q("Jam berapa sebaiknya berangkat ke Kawah Putih?", "Sekitar pukul 06.00 dari pusat Bandung, supaya tiba sebelum ramai dan kabut turun."),
        ],
    },
    {
        "key": "tips-antar-jemput-bandara-soekarno-hatta",
        "title": "Tips antar-jemput Bandara Soekarno-Hatta dari Bogor dan Bandung",
        "category": "Panduan",
        "publishedAt": "2026-10-05",
        "excerpt": "Dari Bogor, sediakan 1,5–2,5 jam ke Soekarno-Hatta; dari Bandung, 3–4 jam. Untuk penerbangan pagi, berangkat jauh lebih awal, dan kirim nomor penerbangan saat memesan supaya driver bisa memantau jadwal kedatangan.",
        "seo": {"title": "Tips Antar-Jemput Bandara Soekarno-Hatta dari Bogor & Bandung", "description": "Berapa lama perjalanan ke Bandara Soekarno-Hatta dari Bogor dan Bandung, kapan sebaiknya berangkat, dan cara penjemputan saat mendarat."},
        "body": """
Perjalanan ke Bandara Soekarno-Hatta lebih sering meleset karena berangkat terlalu mepet daripada karena jaraknya. Berikut patokan yang kami pakai untuk tamu dari Bogor dan Bandung.
## Berapa lama perjalanannya?
- Dari Bogor: sekitar 1,5–2,5 jam lewat Tol Jagorawi, lingkar luar Jakarta, lalu tol bandara. Detailnya di halaman [travel Bogor–Bandara Soekarno-Hatta](/travel/bogor-bandara-soekarno-hatta).
- Dari Bandung: sekitar 3–4 jam lewat Tol Cipularang dan Jakarta–Cikampek. Lihat [travel Bandung–Bandara Soekarno-Hatta](/travel/bandung-bandara-soekarno-hatta).
## Kapan sebaiknya berangkat?
- Penerbangan domestik: tiba di bandara sekitar 2 jam sebelum jadwal terbang.
- Penerbangan internasional: tiba sekitar 3 jam sebelumnya.
- Tambahkan waktu tempuh, lalu cadangan 30–60 menit untuk hari kerja pagi, Jumat sore, dan akhir pekan panjang.
## Saat dijemput di bandara
Kirim nomor penerbangan dan terminal saat memesan. Driver memantau jadwal pendaratan, jadi bila pesawat terlambat, penjemputan ikut menyesuaikan. Setelah mengambil bagasi, hubungi driver lewat WhatsApp untuk titik temu.
## Pilih mobil sesuai bawaan
Koper sering jadi masalah di perjalanan bandara. Untuk 4 orang dengan koper besar, pilih minimal [Xpander](/armada/mitsubishi-xpander) atau [Innova Reborn](/armada/toyota-innova-reborn). Rombongan lebih besar lebih nyaman dengan [Hiace](/armada/toyota-hiace-commuter).
""",
        "faq": [
            q("Berapa lama dari Bogor ke Bandara Soekarno-Hatta?", "Sekitar 1,5–2,5 jam lewat tol, tergantung jam berangkat."),
            q("Bagaimana jika pesawat saya terlambat?", "Kirim nomor penerbangan saat memesan. Driver memantau jadwal pendaratan dan menyesuaikan waktu penjemputan."),
        ],
    },
    {
        "key": "aturan-ganjil-genap-dan-sistem-satu-arah-puncak",
        "title": "Ganjil-genap Jakarta dan sistem satu arah Puncak: yang perlu diketahui",
        "category": "Tips",
        "city": "city-jakarta",
        "publishedAt": "2026-10-08",
        "excerpt": "Di Jakarta, ganjil-genap berlaku di sejumlah ruas pada jam sibuk hari kerja. Di Puncak, kepolisian memberlakukan sistem satu arah pada akhir pekan dan libur panjang, sehingga jam berangkat menentukan lancar tidaknya perjalanan.",
        "seo": {"title": "Ganjil-Genap Jakarta & Sistem Satu Arah Puncak untuk Penyewa Mobil", "description": "Cara kerja ganjil-genap di Jakarta dan sistem satu arah di jalur Puncak, serta bagaimana mengatur jam berangkat saat menyewa mobil dengan driver."},
        "body": """
Dua aturan lalu lintas ini paling sering memengaruhi jadwal tamu kami: ganjil-genap di Jakarta dan sistem satu arah di jalur Puncak. Keduanya bisa berubah sewaktu-waktu, jadi selalu cek pengumuman terbaru dari kepolisian dan dinas perhubungan sebelum berangkat.
## Ganjil-genap di Jakarta
Pada hari kerja, sejumlah ruas utama Jakarta hanya boleh dilewati mobil berpelat ganjil pada tanggal ganjil dan pelat genap pada tanggal genap, di jam sibuk pagi dan sore. Aturan ini umumnya tidak berlaku di akhir pekan dan hari libur nasional.
Saat menyewa mobil dengan driver, Anda tidak perlu menghafal ruasnya. Sampaikan jadwal dan tujuan saat memesan; driver memilih rute atau jam berangkat yang sesuai dengan pelat mobil di hari itu.
## Sistem satu arah di Puncak
Pada akhir pekan dan libur panjang, jalur Puncak sering diberlakukan satu arah: pagi hari untuk kendaraan yang naik, siang atau sore untuk yang turun. Di luar jam tersebut, kendaraan dari arah berlawanan harus menunggu, kadang berjam-jam.
- Naik ke Puncak: berangkat sepagi mungkin di hari Sabtu.
- Turun dari Puncak: perhatikan jam pemberlakuan arah turun pada hari Minggu.
- Hindari melewati Puncak di akhir pekan bila tujuan Anda sebenarnya Bandung; lewat tol biasanya lebih cepat.
## Kenapa memakai driver lokal membantu
Driver yang setiap minggu melewati Jagorawi dan Puncak tahu kapan aturan biasanya berlaku dan kapan jalur alternatif lebih masuk akal. Rencana perjalanan ke Puncak dari Bogor ada di halaman [sewa mobil Bogor](/sewa-mobil-bogor), dan untuk Jakarta di [sewa mobil Jakarta](/sewa-mobil-jakarta).
""",
        "faq": [
            q("Apakah mobil sewaan terkena ganjil-genap?", "Ya, mobil berpelat hitam termasuk mobil sewaan tetap mengikuti aturan ganjil-genap. Driver kami mengatur rute dan jam berangkat sesuai pelat mobil di hari perjalanan."),
            q("Kapan sistem satu arah Puncak berlaku?", "Umumnya pada akhir pekan dan libur panjang, dengan jam yang ditentukan kepolisian di hari itu. Pagi untuk arah naik, siang atau sore untuk arah turun."),
        ],
    },
    {
        "key": "checklist-sewa-mobil-pengantin",
        "title": "Checklist sewa mobil pengantin supaya hari H berjalan lancar",
        "category": "Tips",
        "publishedAt": "2026-10-12",
        "excerpt": "Pesan mobil pengantin 1–2 bulan sebelum acara, konfirmasi jam jemput dan rute antar lokasi, sepakati aturan hiasan, dan siapkan satu kontak keluarga yang berkoordinasi dengan driver di hari H.",
        "seo": {"title": "Checklist Sewa Mobil Pengantin", "description": "Hal yang perlu disiapkan saat menyewa mobil pengantin: kapan memesan, memilih unit, jadwal jemput, hiasan, dan koordinasi dengan driver di hari H."},
        "body": """
Mobil pengantin adalah detail kecil yang baru terasa penting ketika terlambat. Checklist ini kami susun dari pertanyaan yang paling sering diajukan calon pengantin.
## 1–2 bulan sebelum acara
- Pesan unit sejak awal, terutama untuk tanggal favorit dan musim pernikahan.
- Pilih unit sesuai kesan yang diinginkan: [Alphard](/armada/toyota-alphard) untuk kesan paling mewah, [Zenix Q Hybrid Modellista](/armada/toyota-zenix-q-hybrid-modellista) untuk kenyamanan dengan tarif lebih terjangkau, atau [Fortuner](/armada/toyota-fortuner) untuk kesan gagah.
- Tentukan apakah perlu mobil tambahan untuk keluarga inti.
## 1 minggu sebelum acara
- Konfirmasi jadwal: jam jemput pengantin, lokasi akad, lokasi resepsi, dan jam selesai.
- Sepakati aturan hiasan mobil; gunakan hiasan yang tidak merusak cat.
- Tunjuk satu anggota keluarga sebagai kontak untuk driver.
## Di hari H
- Driver tiba lebih awal dari jam jemput untuk persiapan.
- Simpan nomor driver dan nomor admin di ponsel kontak keluarga.
- Siapkan waktu cadangan di antara lokasi, terutama bila akad dan resepsi berbeda tempat.
Konsultasi unit dan jadwal untuk pernikahan bisa dilakukan lewat halaman [mobil pengantin](/wedding).
""",
        "faq": [
            q("Kapan sebaiknya memesan mobil pengantin?", "Sekitar 1–2 bulan sebelum acara, lebih awal untuk tanggal favorit dan musim pernikahan."),
            q("Mobil apa yang cocok untuk pengantin?", "Toyota Alphard untuk kesan paling mewah, Zenix Q Hybrid Modellista untuk kenyamanan dengan tarif lebih terjangkau, atau Fortuner untuk kesan gagah."),
        ],
    },
]
