"""Cancellation policy (Pengaturan situs → Tarif → Kebijakan pembatalan).

Must match what the booking system enforces (computeCancellationPenalty in the
dashboard API): 20% before the travel day, 50% on the day until 10:00 WIB while
the trip has not started, 100% after that. Fees are a share of the total booking.
"""

POLICY = {
    "title": "Kebijakan pembatalan",
    "intro": "Kami memahami bahwa rencana perjalanan dapat berubah sewaktu-waktu. Untuk menjaga kenyamanan dan kelancaran layanan, berikut ketentuan pembatalan yang berlaku:",
    "items": [
        {"when": "Sebelum hari keberangkatan", "fee": "Biaya 20% dari total pesanan (DP 20% tidak dapat dikembalikan)", "text": "Pembatalan hingga pukul 23.59 WIB sehari sebelum keberangkatan."},
        {"when": "Hari H hingga pukul 10.00 WIB, perjalanan belum dimulai", "fee": "Biaya 50% dari total pesanan", "text": "Pembatalan pada hari keberangkatan sampai pukul 10.00 WIB, selama driver belum berangkat menjemput."},
        {"when": "Hari H setelah pukul 10.00 WIB, perjalanan sudah dimulai, atau setelah hari H", "fee": "Biaya 100% dari total pesanan", "text": "Pembatalan setelah pukul 10.00 WIB pada hari keberangkatan, setelah perjalanan dimulai (driver sudah berangkat menjemput), atau setelah hari keberangkatan lewat."},
    ],
    "closing": "Biaya pembatalan dihitung dari total pesanan. Terima kasih atas pengertian dan kerja sama Anda.",
}

POLICY_EN = {
    "title": "Cancellation policy",
    "intro": "Plans change, and we understand that. To keep things fair for every customer and driver, these are our cancellation terms:",
    "items": [
        {"when": "Before the day of travel", "fee": "20% of the total booking (the 20% deposit is non-refundable)", "text": "Cancelling up to 11:59 p.m. WIB the day before you travel."},
        {"when": "On the day, up to 10 a.m. WIB, trip not yet started", "fee": "50% of the total booking", "text": "Cancelling on the day of travel up to 10:00 a.m. WIB, as long as the driver has not yet set off to pick you up."},
        {"when": "On the day after 10 a.m. WIB, once the trip has started, or after the day", "fee": "100% of the total booking", "text": "Cancelling after 10:00 a.m. WIB on the day of travel, once the trip has started (the driver has set off to pick you up), or after the travel day has passed."},
    ],
    "closing": "Cancellation fees are calculated on the total booking. Thank you for your understanding.",
}
