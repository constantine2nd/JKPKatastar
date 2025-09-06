// MongoDB initialization script for JKP Katastar
// This script runs when the MongoDB container starts for the first time

print('Starting MongoDB initialization for JKP Katastar...');

// Switch to the admin database for authentication
db = db.getSiblingDB('admin');

// Authenticate as the root user
db.auth('admin', 'password123');

// Create the application database
db = db.getSiblingDB('jkp_katastar');

// Create collections with basic indexes for performance
print('Creating collections and indexes...');

// Graves collection with geospatial and search indexes
db.createCollection('graves');
db.graves.createIndex({ "LAT": 1, "LON": 1 }); // Geospatial queries
db.graves.createIndex({ "cemetery": 1 }); // Cemetery filtering
db.graves.createIndex({ "status": 1 }); // Status filtering
db.graves.createIndex({ "number": 1, "row": 1, "field": 1 }); // Plot identification

// Deceased collection with search indexes
db.createCollection('deceased');
db.deceased.createIndex({ "firstName": 1 }); // Name searches
db.deceased.createIndex({ "lastName": 1 }); // Name searches
db.deceased.createIndex({ "dateOfDeath": -1 }); // Date sorting
db.deceased.createIndex({ "dateOfBirth": 1 }); // Birth date queries

// Payers collection
db.createCollection('payers');
db.payers.createIndex({ "firstName": 1, "lastName": 1 }); // Name searches
db.payers.createIndex({ "email": 1 }); // Email lookups

// Users collection with unique constraints
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true }); // Unique email
db.users.createIndex({ "username": 1 }, { unique: true }); // Unique username

// Cemeteries collection
db.createCollection('cemeteries');
db.cemeteries.createIndex({ "name": 1 }); // Cemetery name searches
db.cemeteries.createIndex({ "location": "2dsphere" }); // Geospatial queries

// Grave types collection
db.createCollection('gravetypes');
db.gravetypes.createIndex({ "name": 1 }); // Type name searches

// Grave requests collection
db.createCollection('graverequests');
db.graverequests.createIndex({ "status": 1 }); // Request status filtering
db.graverequests.createIndex({ "createdAt": -1 }); // Date sorting

// Logs collection for audit trail
db.createCollection('logs');
db.logs.createIndex({ "timestamp": -1 }); // Time-based queries
db.logs.createIndex({ "userId": 1 }); // User activity tracking

// Create default admin user if users collection is empty
print('Creating default admin user...');
const userCount = db.users.countDocuments();
if (userCount === 0) {
    // Note: In a real application, you would hash this password properly
    // This is just for initial setup - change password immediately after first login
    db.users.insertOne({
        username: 'admin',
        email: 'admin@jkpkatastar.local',
        password: '$2a$10$8K1p/a0drtIEC6HcPqremOgwelJz9hRzKnHa8Q2.qiJYo6PJCWOsK', // 'admin123' - CHANGE THIS!
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    print('Default admin user created (username: admin, password: admin123 - PLEASE CHANGE!)');
}

// Create sample cemetery if none exists
print('Creating sample data...');
const cemeteryCount = db.cemeteries.countDocuments();
if (cemeteryCount === 0) {
    const sampleCemetery = {
        name: 'Gradsko Groblje Temerin',
        address: 'Temerin, Vojvodina, Serbia',
        location: {
            type: 'Point',
            coordinates: [19.8935, 45.4053] // [longitude, latitude] for Temerin
        },
        description: 'Main municipal cemetery in Temerin',
        established: new Date('1950-01-01'),
        area: 50000, // square meters
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const cemetery = db.cemeteries.insertOne(sampleCemetery);
    const cemeteryId = cemetery.insertedId;
    print('Sample cemetery created with ID: ' + cemeteryId);

    // Create sample grave types
    const graveTypes = [
        {
            name: 'Standardni grob',
            description: 'Standardni grob za jednu osobu',
            capacity: 1,
            price: 50000,
            dimensions: '2.5m x 1.2m',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Porodični grob',
            description: 'Porodični grob za više osoba',
            capacity: 4,
            price: 150000,
            dimensions: '3m x 2m',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Dečji grob',
            description: 'Grob za decu do 14 godina',
            capacity: 1,
            price: 25000,
            dimensions: '1.5m x 1m',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    db.gravetypes.insertMany(graveTypes);
    print('Sample grave types created');
}

// Create database user with read/write access
print('Creating application database user...');
try {
    db.createUser({
        user: 'jkpapp',
        pwd: 'jkpapp123',
        roles: [
            {
                role: 'readWrite',
                db: 'jkp_katastar'
            }
        ]
    });
    print('Application user created successfully');
} catch (e) {
    if (e.code === 51003) {
        print('Application user already exists, skipping creation');
    } else {
        print('Error creating application user: ' + e.message);
    }
}

print('MongoDB initialization completed successfully!');
print('');
print('=== IMPORTANT SECURITY NOTES ===');
print('1. Change the default admin password immediately!');
print('2. Update database passwords in production!');
print('3. Configure proper network security!');
print('4. Enable MongoDB authentication in production!');
print('================================');
