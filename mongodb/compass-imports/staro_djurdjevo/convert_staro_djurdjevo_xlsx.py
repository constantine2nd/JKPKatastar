#!/usr/bin/env python3
"""
Converts staro_djurdjevo.xlsx to JSON files ready for MongoDB Compass import.

Output files:
  - djurdjevo_cemetery.json      → import into 'cemeteries' collection
  - djurdjevo_new_gravetypes.json → import into 'gravetypes' collection (new types only)
  - djurdjevo_graves.json        → import into 'graves' collection
  - djurdjevo_deceaseds.json     → import into 'deceaseds' collection

Usage:
  python3 convert_staro_djurdjevo_xlsx.py
"""

import json
import openpyxl
from bson import ObjectId

XLSX_FILE = "staro_djurdjevo.xlsx"

# --- Cemetery ---
DJURDJEVO_CEMETERY_ID = str(ObjectId())
DJURDJEVO_CEMETERY = {
    "_id": {"$oid": DJURDJEVO_CEMETERY_ID},
    "name": "Staro Đurđevo",
    "LAT": 45.396183,
    "LON": 19.888225,
    "zoom": 17,
    "__v": 0,
}

# --- Grave types already in DB (original + from sirig_gravetypes.json) ---
EXISTING_GRAVE_TYPES = {
    "GM1":  "654cc82cacdd97ad9c69e1c7",
    "GM2":  "654cc840acdd97ad9c69e1c9",
    "GR2":  "654cc84bb1c1e912286e7627",
    "GR4":  "654cc860b1c1e912286e7629",
    "GR6":  "654ccb9c5b43c40f706613bc",
    # From sirig_gravetypes.json (already imported):
    "GM3":  "69bc7fc9c2290223480c543b",
    "GM4":  "69bc7fc9c2290223480c543c",
    "GM5":  "69bc7fc9c2290223480c543d",
    "GM6":  "69bc7fc9c2290223480c543e",
    "GM7":  "69bc7fc9c2290223480c543f",
    "GM11": "69bc7fc9c2290223480c5440",
}

# Types found in this xlsx that need new entries:
#   GM2+1 → new type (capacity 3, special)
#   grobnica → new type (generic tomb)
#   '6' → GM6 (alias)
#   '9' → new GM9
#   ',,' → fallback GM1

NEW_GRAVE_TYPE_DEFS = {
    "GM2+1": {"capacity": 3, "description": "grobno mesto GM2+1"},
    "GM9":   {"capacity": 9, "description": "grobno mesto GM9"},
    "grobnica": {"capacity": 2, "description": "grobnica"},
}

grave_type_ids = dict(EXISTING_GRAVE_TYPES)
new_grave_types = []
for name, defn in NEW_GRAVE_TYPE_DEFS.items():
    oid = str(ObjectId())
    grave_type_ids[name] = oid
    new_grave_types.append({
        "_id": {"$oid": oid},
        "name": name,
        "capacity": defn["capacity"],
        "description": defn["description"],
        "__v": 0,
    })

EXCEL_TYPE_ALIASES = {
    "6":    "GM6",
    "9":    "GM9",
    ",,":   "GM1",
    "GM2+1": "GM2+1",
    "grobnica": "grobnica",
}

def resolve_type(raw_type):
    if raw_type is None:
        return "GM1"
    raw = str(raw_type).strip()
    canonical = EXCEL_TYPE_ALIASES.get(raw, raw)
    if canonical not in grave_type_ids:
        print(f"  WARNING: unknown type '{raw}' -> '{canonical}', falling back to GM1")
        return "GM1"
    return canonical

def year_to_date(value):
    if value is None:
        return None
    s = str(value).strip()
    if not s or s in ('', ' ', '0'):
        return None
    try:
        year = int(float(s))
        if year < 1800 or year > 2100:
            return None
        return {"$date": f"{year}-01-01T00:00:00.000Z"}
    except (ValueError, TypeError):
        return None

# --- Parse Excel ---
wb = openpyxl.load_workbook(XLSX_FILE)
ws = wb["grobna mesta"]

graves_data = []
current_grave = None
current_field = None
current_row_n = None

for i, cells in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        continue  # skip header

    c_field, c_row = cells[1], cells[2]
    br_parc, gtype = cells[4], cells[5]
    lat, lon = cells[6], cells[7]
    name, surname, birth, death = cells[8], cells[9], cells[10], cells[11]

    if c_field is not None:
        current_field = c_field
    if c_row is not None:
        current_row_n = c_row

    if br_parc is not None:
        current_grave = {
            "field": current_field,
            "row": current_row_n,
            "number": br_parc,
            "type": resolve_type(gtype),
            "LAT": float(lat) if lat is not None else None,
            "LON": float(lon) if lon is not None else None,
            "deceased": [],
        }
        graves_data.append(current_grave)

    if (name or surname) and current_grave is not None:
        birth_clean = None if (birth is None or str(birth).strip() == '') else birth
        death_clean = None if (death is None or str(death).strip() == '') else death
        current_grave["deceased"].append({
            "name": str(name).strip() if name else None,
            "surname": str(surname).strip() if surname else None,
            "birth": birth_clean,
            "death": death_clean,
        })

print(f"Parsed {len(graves_data)} graves")
print(f"Total deceased: {sum(len(g['deceased']) for g in graves_data)}")

# --- Build Compass JSON documents ---
graves_json = []
deceaseds_json = []

for g in graves_data:
    grave_oid = str(ObjectId())
    type_name = g["type"]

    if g["LAT"] is None or g["LON"] is None:
        print(f"  INFO: Grave field={g['field']} row={g['row']} number={g['number']} has no coords, setting 0")
        g["LAT"] = 0.0
        g["LON"] = 0.0

    status = "OCCUPIED" if g["deceased"] else "FREE"

    graves_json.append({
        "_id": {"$oid": grave_oid},
        "number": g["number"],
        "row": g["row"],
        "field": g["field"],
        "LAT": g["LAT"],
        "LON": g["LON"],
        "status": status,
        "cemetery": {"$oid": DJURDJEVO_CEMETERY_ID},
        "graveType": {"$oid": grave_type_ids[type_name]},
        "__v": 0,
    })

    for dec in g["deceased"]:
        if not dec["name"] and not dec["surname"]:
            continue
        entry = {
            "_id": {"$oid": str(ObjectId())},
            "name": dec["name"] or "",
            "surname": dec["surname"] or "",
            "grave": {"$oid": grave_oid},
            "__v": 0,
        }
        birth_date = year_to_date(dec["birth"])
        death_date = year_to_date(dec["death"])
        if birth_date:
            entry["dateBirth"] = birth_date
        if death_date:
            entry["dateDeath"] = death_date
        deceaseds_json.append(entry)

# --- Write output files ---
with open("djurdjevo_cemetery.json", "w", encoding="utf-8") as f:
    json.dump([DJURDJEVO_CEMETERY], f, ensure_ascii=False, indent=2)
print("Written: djurdjevo_cemetery.json")

with open("djurdjevo_new_gravetypes.json", "w", encoding="utf-8") as f:
    json.dump(new_grave_types, f, ensure_ascii=False, indent=2)
print(f"Written: djurdjevo_new_gravetypes.json ({len(new_grave_types)} new types)")

with open("djurdjevo_graves.json", "w", encoding="utf-8") as f:
    json.dump(graves_json, f, ensure_ascii=False, indent=2)
print(f"Written: djurdjevo_graves.json ({len(graves_json)} graves)")

with open("djurdjevo_deceaseds.json", "w", encoding="utf-8") as f:
    json.dump(deceaseds_json, f, ensure_ascii=False, indent=2)
print(f"Written: djurdjevo_deceaseds.json ({len(deceaseds_json)} deceased)")
