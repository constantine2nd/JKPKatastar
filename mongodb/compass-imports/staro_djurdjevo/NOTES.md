# Staro Đurđevo Cemetery — Import Notes

## Source File
`staro_djurdjevo.xlsx` — Sheet: `grobna mesta`

## Stats
| | Count |
|---|---|
| Graves | 2,513 |
| Occupied | 2,512 |
| Free | 1 |
| Deceased | 4,287 |

## New Grave Types Added
These 3 types did not exist in the original DB or Sirig import:

| Name | Capacity | Description |
|------|----------|-------------|
| GM2+1 | 3 | grobno mesto GM2+1 |
| GM9 | 9 | grobno mesto GM9 |
| grobnica | 2 | grobnica |

## Issues Found

### 1. Grave identifier uses `br. Parc` instead of `number`
The `number` column (col 3) is empty throughout the file.
The actual grave identifier is `br. Parc` (parcel number, col 4), which is used as the `number` field.
This is consistent with how the app models graves (field + row + number).

### 2. Birth/death stored as year only
The Excel contains only years (e.g. `1930`, `1991`), not full dates.
All dates are converted to `January 1st` of that year (e.g. `1930-01-01`).
**Action required:** Full dates are unknown — this is a data limitation of the source file.

### 3. Death field contains whitespace instead of null
Some rows have death values like `'     '` (spaces only).
These are treated as missing (no `dateDeath` field stored).

### 4. Ambiguous grave type values
Some cells had non-standard type values that were mapped automatically:

| Excel value | Mapped to | Reason |
|-------------|-----------|--------|
| `6` | GM6 | Numeric — assumed GM6 |
| `9` | GM9 | Numeric — assumed GM9 |
| `,,` | GM1 | Garbage value — defaulted to GM1 |
| `grobnica` | grobnica | Generic tomb — new type created |
| `GM2+1` | GM2+1 | Special combo type — new type created |

**Action required:** Verify `,,` defaulted to GM1 is correct. Check `grobnica` capacity (set to 2).

### 5. Cemetery center coordinates are approximate
LAT/LON for the cemetery record (`45.396183, 19.888225`) is calculated as the average
of all grave coordinates, not the official center.
**Action required:** Adjust cemetery coordinates and zoom level in the app if needed.

## Import Order
1. `djurdjevo_cemetery.json` → `cemeteries`
2. `djurdjevo_new_gravetypes.json` → `gravetypes` *(import Sirig types first)*
3. `djurdjevo_graves.json` → `graves`
4. `djurdjevo_deceaseds.json` → `deceaseds`
