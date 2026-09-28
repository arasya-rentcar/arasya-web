"""One-off: turn the old site's registry snapshot into Sanity documents.

Usage: python3 scripts/build-seed.py <path-to-registry-snapshot.json>

Writes src/data/seed.json. The same file is (a) pushed to Sanity by
scripts/seed-sanity.mjs and (b) read by src/lib/content.ts as the fallback
when Sanity is unreachable, so both paths share one document shape.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
snap = json.loads(Path(sys.argv[1]).read_text())
site = snap["site"]
settings = site["settings"]

_key_counter = 0


def key():
    global _key_counter
    _key_counter += 1
    return f"k{_key_counter:05d}"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def block(text, style="normal"):
    return {
        "_type": "block",
        "_key": key(),
        "style": style,
        "markDefs": [],
        "children": [{"_type": "span", "_key": key(), "text": text, "marks": []}],
    }


def bullet(text):
    b = block(text)
    b["listItem"] = "bullet"
    b["level"] = 1
    return b


def faq(q, a):
    return {"_key": key(), "question": q, "answer": a}


docs = []

# ------------------------------------------------------------------ cars
CATEGORY = {
    "Toyota Avanza": "mpv",
    "Suzuki Ertiga": "mpv",
    "Mitsubishi Xpander": "mpv",
    "Daihatsu Terios": "suv",
    "Toyota Rush": "suv",
    "Toyota Innova Reborn": "mpv-premium",
    "Toyota Zenix": "mpv-premium",
    "Toyota Innova Venturer": "mpv-premium",
    "Toyota Zenix Q Hybrid Modellista": "premium",
    "Toyota Fortuner": "suv",
    "Toyota Hiace Commuter": "van",
    "Toyota Hiace Premio": "van",
    "Toyota Alphard": "premium",
    "Isuzu Elf Long": "van",
}
car_ids = {}
for i, f in enumerate(site["fleet"]):
    slug = slugify(f["name"])
    _id = f"car-{slug}"
    car_ids[f["name"]] = _id
    docs.append(
        {
            "_id": _id,
            "_type": "car",
            "name": f["name"],
            "slug": {"_type": "slug", "current": slug},
            "category": CATEGORY.get(f["name"], "mpv"),
            "capacity": f.get("capacity"),
            "priceCity": f.get("dalamKota"),
            "priceAllIn": f.get("allin"),
            "badge": f.get("badge"),
            "imagePath": f"/cars/{f['img']}",
            "order": i,
        }
    )


def car_ref(name):
    return {"_type": "reference", "_ref": car_ids[name], "_key": key()}


# -------------------------------------------------------------- settings
docs.append(
    {
        "_id": "siteSettings",
        "_type": "siteSettings",
        "brandName": "Arasya Rent Car",
        "legalName": "PT. Ayomi Raya",
        "siteUrl": settings["siteUrl"],
        "waPhone": settings["waPhone"],
        "phones": [p["display"] for p in settings["officialPhones"]],
        "address": {
            "street": settings["addressStreet"],
            "locality": settings["addressLocality"],
            "region": "Jawa Barat",
            "postalCode": settings["postalCode"],
            "full": settings["addressLine"],
        },
        "bankAccounts": [
            {"_key": key(), "bank": b["bank"], "number": b["number"], "owner": b["owner"]}
            for b in settings["bankAccounts"]
        ],
        "instagram": settings["instagram"],
        "rateNotes": {
            "city": site["fleetNotes"]["dalamKota"],
            "allIn": site["fleetNotes"]["allin"],
        },
        "trust": [
            {"_key": key(), "title": t["title"], "text": t["description"]}
            for t in site["trustDefaults"]
        ],
        "testimonials": [
            {"_key": key(), "quote": t["quote"], "name": t["name"], "context": t["context"], "link": t.get("link")}
            for t in site["testimonials"]
        ],
        "paymentTerms": "Setelah invoice diterbitkan, Anda mentransfer DP 20% ke rekening resmi. Pelunasan dilakukan saat driver bertemu Anda sebelum keberangkatan, secara tunai atau transfer.",
    }
)

# ------------------------------------------------------------------ home
docs.append(
    {
        "_id": "homePage",
        "_type": "homePage",
        "seo": {
            "title": "Sewa Mobil dengan Driver di Bogor — Arasya Rent Car",
            "description": "Rental mobil dengan driver di Bogor: Avanza, Innova, Fortuner sampai Hiace. Tarif 12 jam mulai Rp500.000 atau paket all-in. Pesan lewat WhatsApp, admin 24 jam.",
        },
        "hero": {
            "eyebrow": "Rental mobil + driver · Kota Bogor",
            "title": "Sewa mobil di Bogor,",
            "titleAccent": "sudah dengan driver",
            "lead": "Dari Avanza sampai Hiace. Untuk harian, ke Puncak, bandara, atau luar kota.",
            "car": car_ref("Toyota Zenix"),
        },
        "featuredCars": [
            car_ref("Toyota Avanza"),
            car_ref("Mitsubishi Xpander"),
            car_ref("Toyota Innova Reborn"),
            car_ref("Toyota Fortuner"),
        ],
    }
)

# ------------------------------------------------------------------ city
for loc in snap["locations"]:
    if loc["key"] != "bogor":
        continue
    ed = loc["editorial"]
    city_faq = [
        faq(
            "Apakah tarif sudah termasuk supir?",
            "Ya, seluruh tarif sudah termasuk jasa driver profesional. Tersedia dua pilihan: tarif Dalam Kota 12 jam (belum termasuk BBM, tol, parkir, dan makan driver) atau tarif All-in (sudah termasuk BBM, tol, dan makan driver).",
        ),
        faq(
            "Bagaimana prosedur pemesanannya?",
            "Hubungi kami melalui WhatsApp. Tim kami mengonfirmasi ketersediaan unit, rincian tarif, dan titik penjemputan sebelum pemesanan dipastikan.",
        ),
        faq(
            "Apakah melayani rute luar kota seperti " + loc["outOfTownExamples"] + "?",
            "Ya. Kami melayani perjalanan luar kota dengan penyesuaian tarif sesuai jarak dan durasi. Sampaikan rencana rute Anda saat meminta penawaran.",
        ),
        faq(
            "Bagaimana jika pemakaian melebihi 12 jam?",
            "Kelebihan durasi dikenakan biaya tambahan per jam yang diinformasikan secara tertulis di awal, sehingga tidak ada biaya yang mengejutkan.",
        ),
        faq(
            "Di mana saja titik penjemputannya?",
            "Supir kami menjemput di titik mana pun di wilayah Bogor dan sekitarnya, termasuk " + loc["pickupPoints"] + ".",
        ),
        faq(
            "Bagaimana ketentuan pembayarannya?",
            "Setelah invoice diterbitkan, Anda mentransfer DP 20% ke rekening resmi BCA a.n. PT. Ayomi Raya. Pelunasan dilakukan saat driver bertemu Anda sebelum keberangkatan, secara tunai atau transfer.",
        ),
    ] + [faq(f["question"], f["answer"]) for f in loc.get("faqExtra", [])]

    docs.append(
        {
            "_id": "city-bogor",
            "_type": "city",
            "name": loc["name"],
            "code": loc["code"],
            "slug": {"_type": "slug", "current": loc["slug"]},
            "country": "ID",
            "isHeadquarters": True,
            "seo": {"title": loc["metaTitle"], "description": loc["metaDescription"]},
            "hero": {
                "eyebrow": "Kantor pusat Arasya · Bogor Barat",
                "title": loc["h1"],
                "lead": loc["heroSubtitle"],
                "car": car_ref("Toyota Innova Reborn"),
            },
            "editorial": {
                "eyebrow": ed["eyebrow"],
                "title": ed["title"],
                "lead": ed["lead"],
                "body": [block(p) for p in ed["paragraphs"]],
            },
            "pickupPoints": loc["pickupPoints"],
            "areaServed": loc["areaServed"],
            "destinations": [
                {
                    "_key": key(),
                    "name": d["name"],
                    "area": d["area"],
                    "text": d["description"],
                    "imagePath": d["image"].replace("/assets/images/bogor/", "/places/"),
                    **(
                        {
                            "credit": f"Foto: {d['imageCredit']['author']}, {d['imageCredit']['licence']}",
                            "creditUrl": d["imageCredit"]["sourceUrl"],
                        }
                        if d.get("imageCredit")
                        else {}
                    ),
                }
                for d in loc["destinations"]
            ],
            "routes": [
                {"_key": key(), "to": r["to"], "duration": r["duration"], "note": r["note"]}
                for r in loc["routes"]
            ],
            "faq": city_faq,
            "sections": ["answer", "fleet", "trust", "editorial", "destinations", "routes", "testimonials", "faq"],
        }
    )

# -------------------------------------------------------------- services
docs.append(
    {
        "_id": "service-wedding",
        "_type": "servicePage",
        "template": "wedding",
        "slug": {"_type": "slug", "current": "wedding"},
        "navLabel": "Wedding",
        "seo": {
            "title": "Sewa Mobil Pengantin di Bogor dengan Driver — Arasya Rent Car",
            "description": "Wedding car di Bogor: Alphard, Zenix Q Hybrid Modellista, Fortuner. Mobil bersih dan elegan dengan driver rapi untuk akad dan resepsi. Cek tanggal lewat WhatsApp.",
        },
        "hero": {
            "eyebrow": "Wedding car · Bogor",
            "title": "Mobil pengantin yang bersih, elegan,",
            "titleAccent": "dan datang tepat waktu",
            "lead": "Mobil bersih dan elegan untuk hari spesial Anda, dengan driver rapi. Untuk akad, resepsi, dan antar keluarga inti.",
            "car": car_ref("Toyota Alphard"),
        },
        "answer": "Arasya Rent Car menyediakan mobil pengantin dengan driver di Bogor, dengan pilihan unit Toyota Alphard, Toyota Zenix Q Hybrid Modellista, dan Toyota Fortuner. Pemesanan melalui WhatsApp; unit, jam, dan titik jemput dikonfirmasi sebelum hari acara.",
        "highlights": [
            {"_key": key(), "title": "Unit premium pilihan", "text": "Alphard, Zenix Q Hybrid Modellista, dan Fortuner untuk mobil pengantin maupun keluarga inti."},
            {"_key": key(), "title": "Dikonfirmasi sebelum hari H", "text": "Unit, jam penjemputan, dan titik jemput disepakati bersama admin sebelum acara."},
            {"_key": key(), "title": "Driver rapi", "text": "Driver berpengalaman yang memahami rute di Bogor dan sekitarnya."},
            {"_key": key(), "title": "Pembayaran resmi", "text": "DP 20% ke rekening BCA a.n. PT. Ayomi Raya, pelunasan saat bertemu driver."},
        ],
        "cars": [car_ref("Toyota Alphard"), car_ref("Toyota Zenix Q Hybrid Modellista"), car_ref("Toyota Fortuner")],
        "steps": [
            {"_key": key(), "title": "Kirim tanggal acara", "text": "Sampaikan tanggal, jam, dan lokasi akad atau resepsi lewat WhatsApp."},
            {"_key": key(), "title": "Pilih unit", "text": "Admin mengirim ketersediaan unit dan rincian tarif."},
            {"_key": key(), "title": "Konfirmasi dan DP", "text": "Invoice diterbitkan, DP 20% ke rekening resmi perusahaan."},
        ],
        "faq": [
            faq("Unit apa saja yang tersedia untuk mobil pengantin?", "Toyota Alphard, Toyota Zenix Q Hybrid Modellista, dan Toyota Fortuner. Unit lain dari armada kami juga bisa dipesan untuk rombongan keluarga."),
            faq("Apakah tarif sudah termasuk driver?", "Ya, seluruh tarif sudah termasuk jasa driver."),
            faq("Bagaimana ketentuan pembayarannya?", "Setelah invoice diterbitkan, Anda mentransfer DP 20% ke rekening resmi BCA a.n. PT. Ayomi Raya. Pelunasan dilakukan saat driver bertemu Anda sebelum keberangkatan."),
        ],
    }
)

docs.append(
    {
        "_id": "service-korporat",
        "_type": "servicePage",
        "template": "corporate",
        "slug": {"_type": "slug", "current": "korporat"},
        "navLabel": "Korporat",
        "seo": {
            "title": "Sewa Mobil Perusahaan di Bogor dengan Driver — Arasya Rent Car",
            "description": "Transportasi karyawan dan tamu bisnis di Bogor. Innova, Fortuner, Hiace dengan driver, pembayaran ke rekening PT. Ayomi Raya, admin 24 jam. Minta penawaran lewat WhatsApp.",
        },
        "hero": {
            "eyebrow": "Transportasi perusahaan",
            "title": "Transportasi karyawan dan tamu bisnis,",
            "titleAccent": "terjadwal",
            "lead": "Untuk antar-jemput tamu, rapat di luar kota, dan kebutuhan harian kantor di Bogor dan sekitarnya.",
            "car": car_ref("Toyota Innova Venturer"),
        },
        "answer": "Arasya Rent Car melayani sewa mobil dengan driver untuk perusahaan di Bogor, dikelola oleh PT. Ayomi Raya. Tersedia unit MPV, SUV, hingga van rombongan, dengan pembayaran ke rekening resmi perusahaan dan admin yang siaga 24 jam.",
        "highlights": [
            {"_key": key(), "title": "Badan usaha resmi", "text": "Dikelola PT. Ayomi Raya. Pembayaran hanya ke rekening atas nama perusahaan."},
            {"_key": key(), "title": "Admin 24 jam", "text": "Perubahan jadwal dan permintaan mendadak ditangani lewat WhatsApp."},
            {"_key": key(), "title": "Satu unit sampai rombongan", "text": "Dari MPV untuk tamu, sampai Hiace untuk rombongan kantor."},
            {"_key": key(), "title": "Tarif tertulis", "text": "Tarif dan biaya tambahan dikonfirmasi tertulis di awal."},
        ],
        "cars": [
            car_ref("Toyota Innova Reborn"),
            car_ref("Toyota Innova Venturer"),
            car_ref("Toyota Fortuner"),
            car_ref("Toyota Hiace Commuter"),
            car_ref("Toyota Hiace Premio"),
        ],
        "steps": [
            {"_key": key(), "title": "Kirim kebutuhan", "text": "Tanggal, jumlah penumpang, rute, dan durasi."},
            {"_key": key(), "title": "Terima penawaran", "text": "Admin mengirim unit dan rincian tarif tertulis."},
            {"_key": key(), "title": "Invoice dan jadwal", "text": "Invoice atas nama PT. Ayomi Raya, jadwal driver dikonfirmasi."},
        ],
        "faq": [
            faq("Apakah bisa untuk kebutuhan rutin perusahaan?", "Bisa. Sampaikan jadwal dan kebutuhan unit Anda, admin kami akan mengirim penawaran tertulis."),
            faq("Ke rekening mana pembayaran dilakukan?", "Hanya ke rekening resmi BCA 095 484 0782 a.n. PT. Ayomi Raya."),
            faq("Bagaimana jika pemakaian melebihi 12 jam?", "Kelebihan durasi dikenakan biaya tambahan per jam yang diinformasikan secara tertulis di awal."),
        ],
    }
)

travel = snap["travel"]
DEST_CODE = {"cgk": "CGK", "bandung": "BDG", "garut": "GRT", "bogor": "BGR", "jakarta": "JKT", "serang": "SRG"}
UNIT_IMG = {
    "avanza": "/cars/toyota-avanza",
    "xpander": "/cars/mitsubishi-xpander",
    "reborn": "/cars/toyota-innova-reborn",
    "zenix": "/cars/toyota-innova-zenix",
    "zenixq": "/cars/toyota-zenix-q-hybrid-modellista",
}
docs.append(
    {
        "_id": "service-travel",
        "_type": "servicePage",
        "template": "travel",
        "slug": {"_type": "slug", "current": "travel"},
        "navLabel": "Travel",
        "seo": {
            "title": "Travel Carter Bogor ke Bandung, Garut & Bandara — Arasya Rent Car",
            "description": "Carter mobil door to door dari Bogor ke Bandara Soekarno-Hatta, Bandung, dan Garut. Satu mobil untuk rombongan Anda sendiri. Cek tarif per unit, pesan lewat WhatsApp.",
        },
        "hero": {
            "eyebrow": "Carter · door to door",
            "title": "Travel antar kota,",
            "titleAccent": "dijemput di depan rumah",
            "lead": "Satu mobil untuk rombongan Anda sendiri, tidak digabung dengan penumpang lain.",
            "imagePath": "/places/puncak-kebun-teh.webp",
        },
        "answer": "Travel carter Arasya adalah layanan satu mobil dengan driver untuk rombongan Anda sendiri, dijemput dan diantar sampai alamat tujuan. Dari Bogor tersedia rute ke Bandara Soekarno-Hatta mulai Rp500.000, Bandung mulai Rp1.100.000, dan Garut mulai Rp1.200.000 per mobil.",
        "units": [
            {"_key": key(), "key": u["key"], "name": u["name"], "capacity": u["capacity"], "imagePath": UNIT_IMG[u["key"]]}
            for u in travel["units"]
        ],
        "origins": [{"_key": key(), "key": o["key"], "code": o["code"], "name": o["name"]} for o in travel["origins"]],
        "routes": [
            {
                "_key": key(),
                "origin": r["origin"],
                "dest": r["dest"],
                "destName": r["destName"],
                "destCode": DEST_CODE.get(r["dest"], r["dest"][:3].upper()),
                "prices": [{"_key": key(), "unit": k, "price": v} for k, v in r["prices"].items()],
            }
            for r in travel["routes"]
        ],
        "highlights": [
            {"_key": key(), "title": "Door to door", "text": "Dijemput di alamat Anda, diantar sampai tujuan."},
            {"_key": key(), "title": "Satu mobil, satu rombongan", "text": "Tidak digabung dengan penumpang lain."},
            {"_key": key(), "title": "Tarif per mobil", "text": "Harga dihitung per unit, bukan per orang."},
        ],
        "faq": [
            faq("Apakah tarif travel dihitung per orang?", "Tidak. Tarif dihitung per mobil, untuk rombongan Anda sendiri."),
            faq("Apakah bisa dijemput di rumah?", "Ya. Layanan carter kami door to door: dijemput di alamat Anda dan diantar sampai alamat tujuan."),
            faq("Rute apa saja yang tersedia?", "Dari Bogor: Bandara Soekarno-Hatta, Bandung, dan Garut. Rute lain bisa ditanyakan ke admin lewat WhatsApp."),
        ],
    }
)

# ------------------------------------------------------------------ posts
for p in snap["posts"]:
    if p.get("cityKey") != "bogor":
        continue
    body = []
    for s in p["sections"]:
        body.append(block(s["heading"], "h2"))
        body += [block(t) for t in s.get("paragraphs", [])]
        body += [bullet(t) for t in s.get("list", []) or []]
    docs.append(
        {
            "_id": "post-" + p["key"],
            "_type": "post",
            "title": p["title"],
            "slug": {"_type": "slug", "current": p["slug"].replace("blog/", "")},
            "category": p["category"],
            "city": {"_type": "reference", "_ref": "city-bogor"},
            "author": p.get("author") or "Tim Arasya",
            "publishedAt": p["datePublished"],
            "updatedAt": p.get("dateModified") or p["datePublished"],
            "excerpt": p["excerpt"],
            "seo": {"title": p["metaTitle"], "description": p["metaDescription"]},
            "coverPath": "/places/puncak-kebun-teh.webp",
            "body": body,
        }
    )

out = ROOT / "src" / "data" / "seed.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(docs, ensure_ascii=False, indent=1))
print(f"wrote {len(docs)} documents to {out}")
