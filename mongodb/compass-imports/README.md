# MongoDB Compass Import Files

This directory contains JSON files extracted from the `init-mongo.js` script, formatted for easy import into MongoDB Compass GUI.

## Collections Available

- **users.json** - User accounts (7 users including administrators, officers, and visitors)
- **cemeteries.json** - Cemetery locations (5 Serbian cemeteries with GPS coordinates)
- **gravetypes.json** - Grave types (5 types: GM1, GM2, GR2, GR4, GR6)
- **payers.json** - Payers information (2 sample payers)
- **graves.json** - Grave records (3 sample graves with location data)
- **deceaseds.json** - Deceased persons (3 sample records)

## How to Import in MongoDB Compass

1. **Open MongoDB Compass** and connect to your MongoDB instance
2. **Create or select the database** `graves_dev` (or your target database)
3. **For each collection:**
   - Click "Create Collection" or select existing collection
   - Click the "Import Data" button (usually in the toolbar)
   - Select "JSON" as the file type
   - Browse and select the corresponding `.json` file
   - Click "Import"

## Import Order Recommendation

Due to foreign key relationships, import collections in this order:

1. **users.json** - Independent collection
2. **cemeteries.json** - Independent collection  
3. **gravetypes.json** - Independent collection
4. **graves.json** - References cemeteries and gravetypes
5. **payers.json** - References graves
6. **deceaseds.json** - References graves

## Data Notes

- All ObjectIds are preserved from the original data
- Date fields use MongoDB's extended JSON format (`{"$date": "..."}`)
- ObjectId references use the format `{"$oid": "..."}`
- This is sample data - the full production dataset contains 68 graves and 98 deceased records

## Test Users

After importing users.json, you can use these test accounts:

- **Admin:** marko@email.com (Marko - Administrator)
- **Admin:** zeko@email.com (Zeljko - Administrator) 
- **Officer:** pera@detlic.com (Pera - Officer)
- **Visitor:** test@email.com (Test User - Visitor)
- **Visitor:** aljbin@email.com (Aljbin - Visitor)

*Note: All passwords are hashed with bcrypt from production data*

## Indexes

After importing, you may want to create these indexes for better performance:

### Graves Collection
```javascript
db.graves.createIndex({ LAT: 1, LON: 1 });
db.graves.createIndex({ cemetery: 1 });
db.graves.createIndex({ status: 1 });
db.graves.createIndex({ number: 1, row: 1, field: 1 });
```

### Deceased Collection
```javascript
db.deceaseds.createIndex({ name: 1 });
db.deceaseds.createIndex({ surname: 1 });
db.deceaseds.createIndex({ dateDeath: -1 });
db.deceaseds.createIndex({ grave: 1 });
```

### Users Collection
```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ name: 1 });
```

## Troubleshooting

- If you get duplicate key errors, the collection may already contain data
- Make sure to select the correct database before importing
- Verify that ObjectId references match between related collections
- For large imports, increase MongoDB's timeout settings if needed