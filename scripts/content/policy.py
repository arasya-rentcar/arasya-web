"""Cancellation policy (Pengaturan situs → Tarif → Kebijakan pembatalan)."""

POLICY = {
    "title": "Kebijakan pembatalan",
    "intro": "Kami memahami bahwa rencana perjalanan dapat berubah sewaktu-waktu. Untuk menjaga kenyamanan dan kelancaran layanan, berikut ketentuan pembatalan yang berlaku:",
    "items": [
        {"when": "Pembatalan hingga H-1", "fee": "DP 20% tidak dapat dikembalikan", "text": "Pembatalan sampai satu hari sebelum keberangkatan."},
        {"when": "Hari H, sebelum driver tiba atau sebelum pukul 10.00", "fee": "Biaya 50% dari total invoice", "text": "Pembatalan pada hari keberangkatan, sebelum driver tiba di titik jemput atau sebelum pukul 10.00 pagi."},
        {"when": "Hari H, setelah driver tiba atau setelah pukul 10.00", "fee": "Biaya 100% dari total invoice", "text": "Pembatalan pada hari keberangkatan, setelah driver tiba di titik jemput atau setelah pukul 10.00 pagi."},
    ],
    "closing": "Terima kasih atas pengertian dan kerja sama Anda.",
}

POLICY_EN = {
    "title": "Cancellation policy",
    "intro": "Plans change, and we understand that. To keep things fair for every customer and driver, these are our cancellation terms:",
    "items": [
        {"when": "Up to the day before", "fee": "20% deposit is non-refundable", "text": "Cancelling any time up to one day before your trip."},
        {"when": "On the day, before the driver arrives or before 10 a.m.", "fee": "50% of the invoice", "text": "Cancelling on the day of travel, before the driver reaches your pick-up point or before 10 a.m."},
        {"when": "On the day, after the driver arrives or after 10 a.m.", "fee": "100% of the invoice", "text": "Cancelling on the day of travel, once the driver has arrived or after 10 a.m."},
    ],
    "closing": "Thank you for your understanding.",
}
