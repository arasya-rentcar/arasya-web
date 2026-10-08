"""Cancellation policy (Pengaturan situs → Tarif → Kebijakan pembatalan).

Must match what the booking system enforces (the cancellation fee in the
dashboard API). Per rental day, from that day's own price: 20% up to 23:59 WIB
the day before, 50% on the day before 10:00 WIB while the driver has not yet
arrived at the pick-up address, 100% from 10:00 WIB (10:00:00 itself is already
the 100% tier) or once the driver has arrived.
"""

# Fees are per rental day, from that day's own price; every day of an order is
# judged by its own date (owner decision 8 Oct 2026, same rule as the booking
# system). The closing text also carries the worked example, because the policy
# schema has no separate field for it.
CLOSING = (
    "Biaya pembatalan dihitung per hari dari harga hari tersebut. "
    "Biaya tambahan yang sudah terpakai dibayar penuh. "
    "Kelebihan bayar dipotongkan ke tagihan berikutnya atau dikembalikan bila diminta. "
    "Contoh: sewa 3 hari, Rp 1.000.000 per hari, semua dibatalkan. "
    "Batal sehari sebelum hari pertama: Rp 600.000 (3 × 20%). "
    "Batal di hari pertama pukul 08.00 dan driver belum tiba: Rp 900.000 (50% + 20% + 20%). "
    "Batal di hari pertama pukul 11.00: Rp 1.400.000 (100% + 20% + 20%). "
    "Hari kedua dan ketiga dihitung 20% karena belum masuk hari sewanya. "
    "Terima kasih atas pengertian dan kerja sama Anda."
)
CLOSING_EN = (
    "Cancellation fees are calculated per day from that day's price, and every rental day is judged by its own date. "
    "Extra charges already incurred are paid in full. "
    "Any overpayment is deducted from your next bill or refunded on request. "
    "Example: a 3-day rental at Rp 1,000,000 per day, everything cancelled. "
    "Cancelling the day before the first day: Rp 600,000 (3 × 20%). "
    "Cancelling on the first day at 8:00 a.m., driver not yet arrived: Rp 900,000 (50% + 20% + 20%). "
    "Cancelling on the first day at 11:00 a.m.: Rp 1,400,000 (100% + 20% + 20%). "
    "Days two and three are charged 20% because their rental day has not started yet. "
    "Thank you for your understanding."
)

POLICY = {
    "title": "Kebijakan pembatalan",
    "intro": "Kami memahami bahwa rencana perjalanan dapat berubah sewaktu-waktu. Untuk menjaga kenyamanan dan kelancaran layanan, berikut ketentuan pembatalan yang berlaku:",
    "items": [
        {"when": "Paling lambat sehari sebelum hari sewa", "fee": "Biaya 20% dari harga hari tersebut", "text": "Pembatalan hingga pukul 23.59 WIB sehari sebelum hari sewa yang dibatalkan."},
        {"when": "Pada hari sewa sebelum pukul 10.00 WIB, driver belum tiba di alamat jemput", "fee": "Biaya 50% dari harga hari tersebut", "text": "Pembatalan pada hari sewa sebelum pukul 10.00 WIB, selama driver belum tiba di alamat jemput."},
        {"when": "Pada hari sewa mulai pukul 10.00 WIB, atau driver sudah tiba di alamat jemput", "fee": "Biaya 100% dari harga hari tersebut", "text": "Pembatalan pada hari sewa mulai pukul 10.00 WIB, atau setelah driver tiba di alamat jemput."},
    ],
    "closing": CLOSING,
}

POLICY_EN = {
    "title": "Cancellation policy",
    "intro": "Plans change, and we understand that. To keep things fair for every customer and driver, these are our cancellation terms:",
    "items": [
        {"when": "Up to the day before the rental day", "fee": "20% of that day's price", "text": "Cancelling up to 11:59 p.m. WIB the day before the rental day you cancel."},
        {"when": "On the rental day, before 10 a.m. WIB, driver not yet at the pick-up address", "fee": "50% of that day's price", "text": "Cancelling on the rental day before 10:00 a.m. WIB, as long as the driver has not yet arrived at the pick-up address."},
        {"when": "On the rental day from 10 a.m. WIB, or once the driver is at the pick-up address", "fee": "100% of that day's price", "text": "Cancelling on the rental day from 10:00 a.m. WIB, or after the driver has arrived at the pick-up address."},
    ],
    "closing": CLOSING_EN,
}

# The wording this change replaces (as live after 2026-10-08-policy-before-10).
# The migration 2026-10-09-policy-per-day only overwrites a field that still
# holds exactly this text, so Studio edits are kept.
_PREVIOUS = {
    "title": "Kebijakan pembatalan",
    "intro": "Kami memahami bahwa rencana perjalanan dapat berubah sewaktu-waktu. Untuk menjaga kenyamanan dan kelancaran layanan, berikut ketentuan pembatalan yang berlaku:",
    "items": [
        {"when": "Sebelum hari keberangkatan", "fee": "Biaya 20% dari total pesanan (DP 20% tidak dapat dikembalikan)", "text": "Pembatalan hingga pukul 23.59 WIB sehari sebelum keberangkatan."},
        {"when": "Hari H sebelum pukul 10.00 WIB, perjalanan belum dimulai", "fee": "Biaya 50% dari total pesanan", "text": "Pembatalan pada hari keberangkatan sebelum pukul 10.00 WIB, selama driver belum berangkat menjemput."},
        {"when": "Hari H mulai pukul 10.00 WIB, perjalanan sudah dimulai, atau setelah hari H", "fee": "Biaya 100% dari total pesanan", "text": "Pembatalan mulai pukul 10.00 WIB pada hari keberangkatan, setelah perjalanan dimulai (driver sudah berangkat menjemput), atau setelah hari keberangkatan lewat."},
    ],
    "closing": "Biaya pembatalan dihitung dari total pesanan. Terima kasih atas pengertian dan kerja sama Anda.",
}

_PREVIOUS_EN = {
    "title": "Cancellation policy",
    "intro": "Plans change, and we understand that. To keep things fair for every customer and driver, these are our cancellation terms:",
    "items": [
        {"when": "Before the day of travel", "fee": "20% of the total booking (the 20% deposit is non-refundable)", "text": "Cancelling up to 11:59 p.m. WIB the day before you travel."},
        {"when": "On the day, before 10 a.m. WIB, trip not yet started", "fee": "50% of the total booking", "text": "Cancelling on the day of travel before 10:00 a.m. WIB, as long as the driver has not yet set off to pick you up."},
        {"when": "On the day from 10 a.m. WIB, once the trip has started, or after the day", "fee": "100% of the total booking", "text": "Cancelling from 10:00 a.m. WIB on the day of travel, once the trip has started (the driver has set off to pick you up), or after the travel day has passed."},
    ],
    "closing": "Cancellation fees are calculated on the total booking. Thank you for your understanding.",
}

# 50% tier ends *before* 10:00 WIB and the 100% tier starts *at* 10:00 WIB
# (owner decision, Oct 2026). The live Studio text is fixed by
# migrations/2026-10-08-policy-before-10.mjs, which replaces exactly these
# phrases inside the cancellation policy and nothing else. None of the new
# phrases contains an old one, so a re-run is a no-op.
BEFORE_10_REWRITES = [
    ["sampai pukul 10.00", "sebelum pukul 10.00"],
    ["hingga pukul 10.00", "sebelum pukul 10.00"],
    ["s.d. pukul 10.00", "sebelum pukul 10.00"],
    ["s/d pukul 10.00", "sebelum pukul 10.00"],
    ["setelah pukul 10.00", "mulai pukul 10.00"],
]
BEFORE_10_REWRITES_EN = [
    ["up to 10 a.m.", "before 10 a.m."],
    ["up to 10:00 a.m.", "before 10:00 a.m."],
    ["until 10 a.m.", "before 10 a.m."],
    ["until 10:00", "before 10:00"],
    ["after 10 a.m.", "from 10 a.m."],
    ["after 10:00 a.m.", "from 10:00 a.m."],
]
