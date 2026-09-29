"""Bundle the branded unit cards (public/cars/brochure/*.jpg) into one PDF,
public/katalog-arasya-rentcar.pdf, in fleet order. Re-run after adding or
replacing a brochure:  python3 scripts/build-catalog.py"""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
cars = sorted((d for d in json.loads((root / 'src/data/seed.json').read_text()) if d.get('_type') == 'car'), key=lambda c: c.get('order', 99))
pages = [Image.open(p).convert('RGB') for c in cars if (p := root / 'public/cars/brochure' / f"{c['slug']['current']}.jpg").exists()]
out = root / 'public/katalog-arasya-rentcar.pdf'
pages[0].save(out, 'PDF', resolution=150, save_all=True, append_images=pages[1:], quality=80, title='Katalog Armada Arasya Rent Car', author='Arasya Rent Car')
print(f'{out.relative_to(root)}: {len(pages)} pages, {out.stat().st_size // 1024} KB')
