# Sirig Cemetery — Import Notes

## Source File
`IMENA I GODINE SA POLJIMA I REDOVIMA i koordinate za Zelju.xlsx` — Sheet1

## Stats
| | Count |
|---|---|
| Graves | 1,125 |
| Occupied | 1,125 |
| Free | 0 |
| Deceased | 2,008 |

## New Grave Types Added
These 6 types did not exist in the original DB and are created by this import:

| Name | Capacity | Description |
|------|----------|-------------|
| GM3 | 3 | trojno grobno mesto GM3 |
| GM4 | 4 | grobno mesto GM4 |
| GM5 | 5 | grobno mesto GM5 |
| GM6 | 6 | grobno mesto GM6 |
| GM7 | 7 | grobno mesto GM7 |
| GM11 | 11 | grobno mesto GM11 |

## Issues Found

### 1. All graves marked OCCUPIED
The Excel has no "FREE" graves — every record has at least one deceased entry.
This may not reflect reality (some graves may be reserved but not yet used).
**Action required:** Review and manually update status for any graves that should be FREE.

### 2. Three graves have no coordinates (set to 0,0)
The following graves had `#VALUE!` or missing LAT/LON in the Excel:
- Field 4, Row 1, Number 349
- Field 7, Row 2, Number 785
- Field 8, Row 2, Number 897

**Action required:** Fix coordinates manually in Compass or via the app after import.

### 3. Birth/death stored as year only
The Excel contains only years (e.g. `1958`, `2023`), not full dates.
All dates are converted to `January 1st` of that year (e.g. `1958-01-01`).
**Action required:** Full dates are unknown — this is a data limitation of the source file.

### 4. Ambiguous grave type values
Some cells had non-standard type values that were mapped automatically:

| Excel value | Mapped to | Reason |
|-------------|-----------|--------|
| `4` | GM4 | Numeric — assumed GM4 |
| `5` | GM5 | Numeric — assumed GM5 |
| `2--3` | GM2 | Ambiguous range — defaulted to GM2 |

**Action required:** Verify these mappings are correct by cross-checking original records.

## Import Order
1. `sirig_cemetery.json` → `cemeteries`
2. `sirig_gravetypes.json` → `gravetypes`
3. `sirig_graves.json` → `graves`
4. `sirig_deceaseds.json` → `deceaseds`
