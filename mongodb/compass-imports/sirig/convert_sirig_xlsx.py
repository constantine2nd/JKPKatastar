#!/usr/bin/env python3
"""
Converts the Sirig cemetery Excel file to JSON files ready for MongoDB Compass import.

Output files:
  - sirig_cemetery.json     → import into 'cemeteries' collection
  - sirig_gravetypes.json   → import into 'gravetypes' collection (new types only)
  - sirig_graves.json       → import into 'graves' collection
  - sirig_deceaseds.json    → import into 'deceaseds' collection

Usage:
  python3 convert_sirig_xlsx.py
"""

import json
import openpyxl
from bson import ObjectId
from datetime import datetime

XLSX_FILE = "IMENA I GODINE SA POLJIMA I REDOVIMA i koordinate za Zelju.xlsx"

# --- Cemetery ---
SIRIG_CEMETERY_ID = str(ObjectId())
SIRIG_CEMETERY = {
    "_id": {"$oid": SIRIG_CEMETERY_ID},
    "name": "Sirig",
    "LAT": 45.44344575,
    "LON": 19.82014928,
    "zoom": 17,
    "__v": 0,
}

# --- Grave types already in DB (from gravetypes.json) ---
EXISTING_GRAVE_TYPES = {
    "GM1": "654cc82cacdd97ad9c69e1c7",
    "GM2": "654cc840acdd97ad9c69e1c9",
    "GR2": "654cc84bb1c1e912286e7627",
    "GR4": "654cc860b1c1e912286e7629",
    "GR6": "654ccb9c5b43c40f706613bc",
}

# Types found in Excel that need to be created:
# GM3, GM4, GM5, GM6, GM7, GM11
# Problematic: '2--3', '4', '5' — mapped to closest type
EXCEL_TYPE_MAP = {
    "GM1":  None,   # exists
    "GM2":  None,   # exists
    "GM3":  None,   # will be created
    "GM4":  None,   # will be created
    "GM5":  None,   # will be created
    "GM6":  None,   # will be created
    "GM7":  None,   # will be created
    "GM11": None,   # will be created
    "2--3": "GM2",  # ambiguous — map to GM2
    "4":    "GM4",  # numeric — map to GM4
    "5":    "GM5",  # numeric — map to GM5
}

NEW_GRAVE_TYPE_DEFS = {
    "GM3":  {"capacity": 3, "description": "trojno grobno mesto GM3"},
    "GM4":  {"capacity": 4, "description": "grobno mesto GM4"},
    "GM5":  {"capacity": 5, "description": "grobno mesto GM5"},
    "GM6":  {"capacity": 6, "description": "grobno mesto GM6"},
    "GM7":  {"capacity": 7, "description": "grobno mesto GM7"},
    "GM11": {"capacity": 11, "description": "grobno mesto GM11"},
}

# Build full type_id map
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

def resolve_type(raw_type):
    if raw_type is None:
        return "GM1"  # default fallback
    raw = str(raw_type).strip()
    # Apply alias map
    canonical = EXCEL_TYPE_MAP.get(raw, raw)
    if canonical is None:
        canonical = raw  # use as-is if no alias
    if canonical not in grave_type_ids:
        print(f"  WARNING: unknown type '{raw}' -> '{canonical}', falling back to GM1")
        return "GM1"
    return canonical

def year_to_date(year):
    if year is None:
        return None
    try:
        return {"$date": f"{int(year)}-01-01T00:00:00.000Z"}
    except (ValueError, TypeError):
        return None

# --- Parse Excel ---
wb = openpyxl.load_workbook(XLSX_FILE)
ws = wb["Sheet1"]

graves_data = []
current_grave = None
current_field = None
current_row_n = None

for i, cells in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        continue  # skip header

    c_field, c_row, number, gtype = cells[2], cells[3], cells[4], cells[5]
    surname, name, birth, death = cells[6], cells[7], cells[8], cells[9]
    lat, lon = cells[11], cells[12]

    if c_field is not None:
        current_field = c_field
    if c_row is not None:
        current_row_n = c_row

    if number is not None:
        current_grave = {
            "field": current_field,
            "row": current_row_n,
            "number": number,
            "type": resolve_type(gtype),
            "LAT": float(lat) if lat and str(lat).replace('.','').replace('-','').isdigit() else None,
            "LON": float(lon) if lon and str(lon).replace('.','').replace('-','').isdigit() else None,
            "deceased": [],
        }
        graves_data.append(current_grave)

    if (name or surname) and current_grave is not None:
        current_grave["deceased"].append({
            "name": str(name).strip() if name else None,
            "surname": str(surname).strip() if surname else None,
            "birth": birth,
            "death": death,
        })

print(f"Parsed {len(graves_data)} graves")
print(f"Total deceased: {sum(len(g['deceased']) for g in graves_data)}")

# --- Build Compass JSON documents ---
graves_json = []
deceaseds_json = []
skipped_graves = 0

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
        "cemetery": {"$oid": SIRIG_CEMETERY_ID},
        "graveType": {"$oid": grave_type_ids[type_name]},
        "__v": 0,
    })

    for dec in g["deceased"]:
        if not dec["name"] and not dec["surname"]:
            continue
        deceaseds_json.append({
            "_id": {"$oid": str(ObjectId())},
            "name": dec["name"] or "",
            "surname": dec["surname"] or "",
            "dateBirth": year_to_date(dec["birth"]),
            "dateDeath": year_to_date(dec["death"]),
            "grave": {"$oid": grave_oid},
            "__v": 0,
        })

# Filter out None dates
for d in deceaseds_json:
    if d["dateBirth"] is None:
        del d["dateBirth"]
    if d["dateDeath"] is None:
        del d["dateDeath"]

# --- Write output files ---
with open("sirig_cemetery.json", "w", encoding="utf-8") as f:
    json.dump([SIRIG_CEMETERY], f, ensure_ascii=False, indent=2)
print("Written: sirig_cemetery.json")

with open("sirig_gravetypes.json", "w", encoding="utf-8") as f:
    json.dump(new_grave_types, f, ensure_ascii=False, indent=2)
print(f"Written: sirig_gravetypes.json ({len(new_grave_types)} new types)")

with open("sirig_graves.json", "w", encoding="utf-8") as f:
    json.dump(graves_json, f, ensure_ascii=False, indent=2)
print(f"Written: sirig_graves.json ({len(graves_json)} graves)")

with open("sirig_deceaseds.json", "w", encoding="utf-8") as f:
    json.dump(deceaseds_json, f, ensure_ascii=False, indent=2)
print(f"Written: sirig_deceaseds.json ({len(deceaseds_json)} deceased)")
