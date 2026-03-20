# Unified Import — Step by Step Guide

## Prerequisites
- MongoDB Compass installed and running
- Docker dev environment running (`./dev.sh start` from project root)
- Connect Compass to: `mongodb://admin:password123@localhost:27017/graves_dev?authSource=admin`
- Select database: `graves_dev`

---

## Import Order

> **Important:** Follow this exact order — graves reference grave types and cemeteries,
> deceased reference graves. Importing out of order will result in broken references.

---

### Step 1 — Cemeteries
**File:** `cemeteries.json`
**Collection:** `cemeteries`
**Records:** 2 (Sirig, Staro Đurđevo)

1. In Compass, select the `cemeteries` collection (create it if it doesn't exist)
2. Click **Add Data → Import File**
3. Select `cemeteries.json`, format: **JSON**
4. Click **Import**

---

### Step 2 — Grave Types
**File:** `gravetypes_new.json`
**Collection:** `gravetypes`
**Records:** 9 new types (GM3, GM4, GM5, GM6, GM7, GM9, GM11, GM2+1, grobnica)

> The original 5 types (GM1, GM2, GR2, GR4, GR6) must already exist in the DB.
> If not, import `gravetypes.json` from the parent folder first.

1. Select the `gravetypes` collection
2. Click **Add Data → Import File**
3. Select `gravetypes_new.json`, format: **JSON**
4. Click **Import**

---

### Step 3 — Graves
**File:** `graves.json`
**Collection:** `graves`
**Records:** 3,638 (1,125 Sirig + 2,513 Staro Đurđevo)

1. Select the `graves` collection
2. Click **Add Data → Import File**
3. Select `graves.json`, format: **JSON**
4. Click **Import**

---

### Step 4 — Deceased
**File:** `deceaseds.json`
**Collection:** `deceaseds`
**Records:** 6,295 (2,008 Sirig + 4,287 Staro Đurđevo)

1. Select the `deceaseds` collection
2. Click **Add Data → Import File**
3. Select `deceaseds.json`, format: **JSON**
4. Click **Import**

---

## After Import — Manual Fixes Required

### Fix graves with missing coordinates
3 graves from Sirig were imported with `LAT: 0, LON: 0` due to invalid data in the source Excel:

| Cemetery | Field | Row | Number |
|----------|-------|-----|--------|
| Sirig | 4 | 1 | 349 |
| Sirig | 7 | 2 | 785 |
| Sirig | 8 | 2 | 897 |

In Compass, find these records and update their LAT/LON manually:
```
db.graves.find({ cemetery: <sirig_id>, LAT: 0 })
```

### Review ambiguous grave type mappings
Some grave type values in the source Excel were non-standard and mapped automatically.
See `sirig/NOTES.md` and `staro_djurdjevo/NOTES.md` for details.

### Verify cemetery coordinates
The Staro Đurđevo cemetery center coordinates are approximate (averaged from graves).
Adjust LAT, LON, and zoom in the app under **Cemeteries** if needed.

---

## Verify Import

Run in Compass **mongosh** tab or shell:

```js
use graves_dev

db.cemeteries.countDocuments()   // expected: 2 (+ any existing)
db.gravetypes.countDocuments()   // expected: 14 (5 existing + 9 new)
db.graves.countDocuments()       // expected: 3638 (+ any existing)
db.deceaseds.countDocuments()    // expected: 6295 (+ any existing)
```
