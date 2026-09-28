"""Merge the content in this folder into src/data/seed.json and write the
data file for the Sanity migration.

    python3 scripts/content/apply.py

Run it again after editing any of the content files; it is idempotent.
The migration (scripts/migrations/2026-09-29-growth.mjs) only fills fields
that are still empty in Sanity, so edits made in the Studio are kept.
"""
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE.parent))

from content.cars import CARS  # noqa: E402
from content.cities import ALL as NEW_CITIES, EN_FIXES, FIXES  # noqa: E402
from content.english import CITIES, HOME, SERVICES, SETTINGS  # noqa: E402
from content.posts import POSTS, blocks  # noqa: E402
from content.routes import ROUTES  # noqa: E402


def keyed(value, path="k"):
    """Give every object inside an array a stable _key (Sanity needs them)."""
    if isinstance(value, list):
        out = []
        for i, v in enumerate(value):
            v = keyed(v, f"{path}.{i}")
            if isinstance(v, dict) and "_key" not in v:
                v = {"_key": "g" + hashlib.sha1(f"{path}.{i}".encode()).hexdigest()[:10], **v}
            out.append(v)
        return out
    if isinstance(value, dict):
        return {k: keyed(v, f"{path}.{k}") for k, v in value.items()}
    return value


def post_doc(p):
    doc = {
        "_id": "post-" + p["key"],
        "_type": "post",
        "title": p["title"],
        "slug": {"_type": "slug", "current": p["key"]},
        "category": p["category"],
        "author": "Tim Arasya",
        "publishedAt": p["publishedAt"],
        "updatedAt": p["publishedAt"],
        "excerpt": p["excerpt"],
        "seo": p["seo"],
        "body": blocks(p["body"], "p" + hashlib.sha1(p["key"].encode()).hexdigest()[:6]),
        "faq": p.get("faq", []),
    }
    if p.get("city"):
        doc["city"] = {"_type": "reference", "_ref": p["city"]}
    if p.get("coverPath"):
        doc["coverPath"] = p["coverPath"]
    return keyed(doc, doc["_id"])


data = {
    "cars": {k: keyed(v, k) for k, v in CARS.items()},
    "routes": [keyed({"origin": o, "dest": d, **v}, f"route.{o}.{d}") for (o, d), v in ROUTES.items()],
    "cities": {k: keyed(v, k + ".en") for k, v in CITIES.items()},
    "services": {k: keyed(v, k + ".en") for k, v in SERVICES.items()},
    "settings": keyed(SETTINGS, "settings.en"),
    "home": keyed(HOME, "home.en"),
    "posts": [post_doc(p) for p in POSTS],
}

cities_data = {
    "cities": [keyed(c, c["_id"]) for c in NEW_CITIES],
    "fixes": [{"id": i, "path": path, "old": old, "new": keyed(new, f"fix.{i}") if isinstance(new, (dict, list)) else new} for i, path, old, new in FIXES + EN_FIXES],
}

out = ROOT / "scripts" / "migrations" / "data" / "2026-09-29-growth.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(data, ensure_ascii=False, indent=1))
(out.parent / "2026-09-29-cities.json").write_text(json.dumps(cities_data, ensure_ascii=False, indent=1))

# Same content into the local fallback dataset.
seed_path = ROOT / "src" / "data" / "seed.json"
seed = json.loads(seed_path.read_text())
by_id = {d["_id"]: d for d in seed}
for cid, fields in data["cars"].items():
    by_id[cid].update(fields)
travel = next(d for d in seed if d["_type"] == "servicePage" and d["template"] == "travel")
for r in data["routes"]:
    target = next(x for x in travel["routes"] if x["origin"] == r["origin"] and x["dest"] == r["dest"])
    target.update({k: v for k, v in r.items() if k not in ("origin", "dest")})
for cid, en in data["cities"].items():
    by_id[cid]["en"] = en
for sid, en in data["services"].items():
    by_id[sid]["en"] = en
by_id["siteSettings"]["en"] = data["settings"]
by_id["homePage"]["en"] = data["home"]
for p in data["posts"]:
    if p["_id"] in by_id:
        by_id[p["_id"]].clear()
        by_id[p["_id"]].update(p)
    else:
        seed.append(p)
for c in cities_data["cities"]:
    if c["_id"] in by_id:
        by_id[c["_id"]].clear()
        by_id[c["_id"]].update(c)
    else:
        seed.append(c)
        by_id[c["_id"]] = c


def locate(doc, path):
    """Walk a path like ["faq", {"_key": "k1"}] or ["en", "faq", 2]; return (parent, key)."""
    node = doc
    for seg in path[:-1]:
        node = next(x for x in node if x.get("_key") == seg["_key"]) if isinstance(seg, dict) else node[seg]
    last = path[-1]
    if isinstance(last, dict):
        return node, next(i for i, x in enumerate(node) if x.get("_key") == last["_key"])
    return node, last


for f in cities_data["fixes"]:
    parent, k = locate(by_id[f["id"]], f["path"])
    if f["old"] is None or parent[k] == f["old"]:
        parent[k] = {**parent[k], **f["new"]} if isinstance(f["new"], dict) else f["new"]

seed_path.write_text(json.dumps(seed, ensure_ascii=False, indent=1))
print(f"wrote {out.relative_to(ROOT)} and updated {seed_path.relative_to(ROOT)} ({len(seed)} documents)")
