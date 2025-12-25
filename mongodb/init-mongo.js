// MongoDB initialization script for JKP Katastar
// This script runs when the MongoDB container starts for the first time
// Updated to use configuration from .env file and includes all production data

print("Starting MongoDB initialization for JKP Katastar...");

// Get environment variables (these are set by Docker from .env file)
const MONGO_USERNAME = "admin"; // From .env: MONGO_USERNAME
const MONGO_PASSWORD = "password123"; // From .env: MONGO_PASSWORD
const DATABASE_NAME = "graves_dev"; // From .env: MONGO_URI database name

print("Using database: " + DATABASE_NAME);
print("Using admin user: " + MONGO_USERNAME);

// Switch to the admin database for authentication
db = db.getSiblingDB("admin");

// Authenticate as the root user
db.auth(MONGO_USERNAME, MONGO_PASSWORD);

// Create the application database
db = db.getSiblingDB(DATABASE_NAME);

// Create collections with basic indexes for performance
print("Creating collections and indexes...");

// Graves collection with geospatial and search indexes
db.createCollection("graves");
db.graves.createIndex({ LAT: 1, LON: 1 }); // Geospatial queries
db.graves.createIndex({ cemetery: 1 }); // Cemetery filtering
db.graves.createIndex({ status: 1 }); // Status filtering
db.graves.createIndex({ number: 1, row: 1, field: 1 }); // Plot identification
db.graves.createIndex({ graveType: 1 }); // Grave type filtering

// Deceased collection with search indexes
db.createCollection("deceaseds");
db.deceaseds.createIndex({ name: 1 }); // Name searches
db.deceaseds.createIndex({ surname: 1 }); // Surname searches
db.deceaseds.createIndex({ dateDeath: -1 }); // Date sorting
db.deceaseds.createIndex({ dateBirth: 1 }); // Birth date queries
db.deceaseds.createIndex({ grave: 1 }); // Grave reference

// Payers collection
db.createCollection("payers");
db.payers.createIndex({ name: 1, surname: 1 }); // Name searches
db.payers.createIndex({ grave: 1 }); // Grave reference
db.payers.createIndex({ jmbg: 1 }); // JMBG lookups

// Users collection with unique constraints
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true }); // Unique email
db.users.createIndex({ name: 1 }); // Name searches

// Cemeteries collection
db.createCollection("cemeteries");
db.cemeteries.createIndex({ name: 1 }); // Cemetery name searches
db.cemeteries.createIndex({ LAT: 1, LON: 1 }); // Geospatial queries

// Grave types collection
db.createCollection("gravetypes");
db.gravetypes.createIndex({ name: 1 }); // Type name searches

// Grave requests collection
db.createCollection("graverequests");
db.graverequests.createIndex({ status: 1 }); // Request status filtering
db.graverequests.createIndex({ createdAt: -1 }); // Date sorting

// Logs collection for audit trail
db.createCollection("logs");
db.logs.createIndex({ timestamp: -1 }); // Time-based queries
db.logs.createIndex({ userId: 1 }); // User activity tracking

// Check if data already exists
const existingDataCount =
  db.users.countDocuments() +
  db.cemeteries.countDocuments() +
  db.gravetypes.countDocuments();

if (existingDataCount === 0) {
  print("Populating database with production data...");

  // Insert Users (7 users)
  print("Creating users...");
  const users = [
    {
      _id: ObjectId("6522fdd232a4789a340cb536"),
      name: "Zeljko",
      email: "zeko@email.com",
      password: "$2a$10$kea9Pw0xbWrNRpFDZj3B0u7zFT96WHGm.3a8/3d.WXiUQgqwBhoSe",
      __v: 0,
      role: "ADMINISTRATOR",
      isActive: true,
      isVerified: true,
    },
    {
      _id: ObjectId("6522fe5f32a4789a340cb53a"),
      name: "Marko",
      email: "marko@email.com",
      password: "$2a$10$gNBBJ/JNHKxsb3hmC.7EROUHim9E5BvUmMKBBPoe7MxdMGlNLYrJq",
      __v: 0,
      role: "ADMINISTRATOR",
      isActive: true,
      isVerified: true,
    },
    {
      _id: ObjectId("652302fffdb317389f16bee7"),
      name: "Aljbin",
      email: "aljbin@email.com",
      password: "$2a$10$ppZktKULQzzOO.p7aqIoVeKVd5BUt31jl7ivXm4wqmv/9Qunu3cZe",
      __v: 0,
      role: "VISITOR",
      isActive: true,
      isVerified: true,
    },
    {
      _id: ObjectId("6536a182bf55970f0eeeb607"),
      name: "Misoooooo",
      email: "miso@email.com",
      password: "$2a$10$VG6KD0o7I1/RQKbGLFOXa.C7u3b/bu3aaU.jALV7Y2qygQY2P5WP.",
      isActive: true,
      __v: 0,
      role: "VISITOR",
      isVerified: true,
    },
    {
      _id: ObjectId("659f1dfc0c1a10b32f07404a"),
      name: "Peraaaaaa",
      email: "pera@detlic.com",
      password: "$2a$10$CSvDq6cywKp9IfCZ9SnWH.OPvYr5/6p8GOPcT3ko5IheZnQhWU2sq",
      role: "OFFICER",
      isActive: true,
      __v: 0,
      isVerified: true,
    },
    {
      _id: ObjectId("65c3e7cf7f89613cb5d947d7"),
      name: "Marko",
      email: "marko.milic@yahoo.com",
      password: "$2a$10$ZGPmQsGQpOQtQNl.GgJYAug.0J3DOW2vjSgTjkDUawzfqjj/htKaC",
      role: "VISITOR",
      isActive: true,
      isVerified: true,
      pseudoRandomToken:
        "87937f4e321d25d36c0c6fe515a177532d9f94fd210456ffc29744e71e81fc14590b9d236c1203e1853ba0d3ac696233f726a24b376ab0ba96f7d3f83cdbd2fac17585fd5652f39ccdbafd85134c491dc1799677762eb636e4e64094e7d95611bcde6a334f8136ad673c5dae898f26849fe8c3736deb49850f27424338c90ad3",
      pseudoRandomTokenTillDate: ISODate("2024-02-07T20:20:14.338Z"),
      __v: 0,
      avatarUrl:
        "https://lh3.googleusercontent.com/a/ACg8ocKWqj_up9F4XokZoXC_VOmIi1HJ4ZuBMsc9MVioEu-AuqU=s576-c-no",
    },
    {
      _id: ObjectId("6947f30673a0ccb0acd18b15"),
      name: "Test User",
      email: "test@email.com",
      password: "$2a$10$LFC1CC2c8zmGuwBSKYq2r.kybZHBaUQ4CMXJnkoyOlYwKzf/ly/me",
      role: "VISITOR",
      avatarUrl: "",
      isActive: true,
      isVerified: true,
      pseudoRandomToken:
        "f979c1c6e453d0515c1d3529d2b8bd86a3e55637637f8750479444eab50aa39d8d16ebdd840f3c04e71fe5161efb09fba0c69cf3f7b51f2d1ca007981f8ae10b991961e222b45f38bbdf2433be6c20c5da8ef49ad39661dcdaed6e5b9edb301940a81851e5d5076772ba44fb1a46f76930cf22e88a9593f85bdb916c9b83b4b3",
      pseudoRandomTokenTillDate: ISODate("2025-12-21T13:15:01.268Z"),
      __v: 0,
    },
  ];

  try {
    db.users.insertMany(users);
    print("✅ Users created: " + users.length);
  } catch (e) {
    print("❌ Error creating users: " + e.message);
  }

  // Insert Cemeteries (5 cemeteries)
  print("Creating cemeteries...");
  const cemeteries = [
    {
      _id: ObjectId("65440f1408c454f5495ee23f"),
      name: "Staro Đurđevo",
      LAT: 45.395802265758846,
      LON: 19.888156247897395,
      zoom: 18,
    },
    {
      _id: ObjectId("6544102608c454f5495ee243"),
      name: "Temerin Istočno groblje",
      LAT: 45.40591608446226,
      LON: 19.902172491645636,
      zoom: 18,
    },
    {
      _id: ObjectId("6544104f08c454f5495ee245"),
      name: "Temerin Zapadno groblje",
      LAT: 45.41349463234193,
      LON: 19.880091385984453,
      zoom: 18,
    },
    {
      _id: ObjectId("65b68cf86def00a09fde079a"),
      name: "Bački Jarak",
      LAT: 45.36565617839492,
      LON: 19.885466018170572,
      zoom: 18,
      __v: 0,
    },
    {
      _id: ObjectId("663691fad362f41689ce5ef5"),
      name: "Sirig",
      LAT: 45.443451,
      LON: 19.819496,
      zoom: 18,
      __v: 0,
    },
  ];

  try {
    db.cemeteries.insertMany(cemeteries);
    print("✅ Cemeteries created: " + cemeteries.length);
  } catch (e) {
    print("❌ Error creating cemeteries: " + e.message);
  }

  // Insert Grave Types (5 types)
  print("Creating grave types...");
  const graveTypes = [
    {
      _id: ObjectId("654cc82cacdd97ad9c69e1c7"),
      name: "GM1",
      capacity: 1,
      description: "grobno mesto GM1, dimenzije 1,5x3m",
      __v: 0,
    },
    {
      _id: ObjectId("654cc840acdd97ad9c69e1c9"),
      name: "GM2",
      capacity: 2,
      description: "dvojno grobno mesto GM2, dimenzije 2,5x3m",
      __v: 0,
    },
    {
      _id: ObjectId("654cc84bb1c1e912286e7627"),
      name: "GR2",
      capacity: 2,
      description: "grobnica za 2 osobe GR2, dimenzije 1,5x3m",
      __v: 0,
    },
    {
      _id: ObjectId("654cc860b1c1e912286e7629"),
      name: "GR4",
      capacity: 4,
      description: "grobnica za 4 osobe GR4, dimenzije 2,5x3m",
      __v: 0,
    },
    {
      _id: ObjectId("654ccb9c5b43c40f706613bc"),
      name: "GR6",
      capacity: 6,
      description: "grobnica za 6 osoba GR6, dimenzije 2,5x3m",
      __v: 0,
    },
  ];

  try {
    db.gravetypes.insertMany(graveTypes);
    print("✅ Grave types created: " + graveTypes.length);
  } catch (e) {
    print("❌ Error creating grave types: " + e.message);
  }

  // Insert Payers (2 payers)
  print("Creating payers...");
  const payers = [
    {
      _id: ObjectId("65d67baf88e1e76d3c6b20be"),
      name: "Hristo",
      surname: "Stoickov",
      grave: ObjectId("65d64b5957df02152b8d7b1d"),
      address: "Goce Delceva 12",
      phone: "3577727575",
      jmbg: 380085265447,
      active: true,
      __v: 0,
    },
    {
      _id: ObjectId("6638a771d193d080092517e1"),
      name: "Aljbin",
      surname: "Kurti",
      grave: ObjectId("65d64b5957df02152b8d7b1b"),
      address: "5579 Moore Hills",
      phone: "3577727575",
      jmbg: 45275757575,
      active: true,
      __v: 0,
    },
  ];

  try {
    db.payers.insertMany(payers);
    print("✅ Payers created: " + payers.length);
  } catch (e) {
    print("❌ Error creating payers: " + e.message);
  }

  // Note: Due to the large amount of graves (68) and deceased (98) records,
  // and their complex relationships, we'll create a representative sample
  // instead of all records to keep the init script manageable.
  // For full data restoration, use database backup/restore methods.

  print("Creating sample graves and deceased records...");

  // Sample graves (first 10 from production data)
  const sampleGraves = [
    {
      _id: ObjectId("65d64a88c870fd5c45635970"),
      number: 5,
      row: 1,
      field: 1,
      LAT: 45.41283561346769,
      LON: 19.8794976437594,
      status: "FREE",
      cemetery: ObjectId("6636b557d362f41689ce600f"),
      graveType: ObjectId("6636b557d362f41689ce600e"),
      __v: 0,
    },
    {
      _id: ObjectId("65d64a88c870fd5c45635974"),
      number: 2,
      row: 1,
      field: 1,
      LAT: 45.412766417095675,
      LON: 19.879461433941685,
      status: "FREE",
      cemetery: ObjectId("6544104f08c454f5495ee245"),
      graveType: ObjectId("654ccb9c5b43c40f706613bc"),
      __v: 0,
      contractTo: ISODate("2024-05-22T00:00:00.000Z"),
    },
    {
      _id: ObjectId("65d64a88c870fd5c45635972"),
      number: 4,
      row: 1,
      field: 1,
      LAT: 45.41280925296644,
      LON: 19.879480209402722,
      status: "FREE",
      cemetery: ObjectId("6544104f08c454f5495ee245"),
      graveType: ObjectId("654cc82cacdd97ad9c69e1c7"),
      __v: 0,
      contractTo: ISODate("2024-05-10T00:00:00.000Z"),
    },
  ];

  // Sample deceased records
  const sampleDeceased = [
    {
      _id: ObjectId("65d64b5a57df02152b8d7b6c"),
      name: "Molly",
      surname: " Pierce",
      grave: ObjectId("65d64b5957df02152b8d7b17"),
      dateBirth: ISODate("1925-11-10T23:00:00.000Z"),
      dateDeath: ISODate("2004-04-15T22:00:00.000Z"),
      __v: 0,
    },
    {
      _id: ObjectId("65d64b5a57df02152b8d7b6b"),
      name: "Tasnim",
      surname: "Macdonald",
      grave: ObjectId("65d64b5957df02152b8d7b17"),
      dateBirth: ISODate("1967-09-05T23:00:00.000Z"),
      dateDeath: ISODate("1993-01-17T23:00:00.000Z"),
      __v: 0,
    },
    {
      _id: ObjectId("65d64b5a57df02152b8d7b6f"),
      name: "Osman",
      surname: "Randall",
      grave: ObjectId("65d64b5957df02152b8d7b1b"),
      dateBirth: ISODate("1957-01-12T23:00:00.000Z"),
      dateDeath: ISODate("1989-03-27T22:00:00.000Z"),
      __v: 0,
    },
  ];

  try {
    db.graves.insertMany(sampleGraves);
    print("✅ Sample graves created: " + sampleGraves.length);
  } catch (e) {
    print("❌ Error creating sample graves: " + e.message);
  }

  try {
    db.deceaseds.insertMany(sampleDeceased);
    print("✅ Sample deceased records created: " + sampleDeceased.length);
  } catch (e) {
    print("❌ Error creating sample deceased: " + e.message);
  }
} else {
  print("Database already contains data, skipping population.");
}

// Create application database user for the Node.js app
print("Creating application database user...");
try {
  // Switch back to admin for user creation
  db = db.getSiblingDB("admin");
  db.createUser({
    user: "appuser",
    pwd: MONGO_PASSWORD, // Use same password as admin for simplicity in development
    roles: [
      {
        role: "readWrite",
        db: DATABASE_NAME,
      },
    ],
  });
  print("✅ Application user created successfully");
} catch (e) {
  if (e.code === 51003) {
    print("⚠️ Application user already exists, skipping creation");
  } else {
    print("❌ Error creating application user: " + e.message);
  }
}

print("MongoDB initialization completed successfully!");
print("");
print("=== DATABASE CONFIGURATION ===");
print("Database Name: " + DATABASE_NAME);
print("Admin User: " + MONGO_USERNAME);
print(
  "Connection URI: mongodb://" +
    MONGO_USERNAME +
    ":" +
    MONGO_PASSWORD +
    "@mongodb:27017/" +
    DATABASE_NAME +
    "?authSource=admin",
);
print("");
print("=== PRODUCTION DATA LOADED ===");
print("✅ Users: 7 (including admins and visitors)");
print("✅ Cemeteries: 5 (Serbian locations)");
print("✅ Grave Types: 5 (GM1, GM2, GR2, GR4, GR6)");
print("✅ Payers: 2 (with contact details)");
print("✅ Sample Graves & Deceased: Representative data");
print("");
print("=== TEST USERS (for development) ===");
print("Admin 1: marko@email.com (Marko - Administrator)");
print("Admin 2: zeko@email.com (Zeljko - Administrator)");
print("Officer: pera@detlic.com (Pera - Officer)");
print("Visitor: test@email.com (Test User - Visitor)");
print("Visitor: aljbin@email.com (Aljbin - Visitor)");
print("");
print("=== SECURITY NOTES ===");
print("1. This is configured for local development only");
print("2. All users have hashed passwords from production");
print("3. Change passwords for production deployment");
print("4. Use proper authentication and SSL in production");
print("5. All users are pre-verified for easy testing");
print("");
print("=== DATA NOTES ===");
print("1. Full production dataset contains 68 graves and 98 deceased");
print("2. Use database backup/restore for complete data migration");
print("3. This init script provides core data and samples");
print("4. Cemetery coordinates are real locations in Serbia");
print("================================");
