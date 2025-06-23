// importData.js (Only for inventory_data.json)

const fs = require('fs/promises'); // For reading files asynchronously
const mysql = require('mysql2/promise'); // MySQL client with Promise support
require('dotenv').config(); // Load environment variables from .env

// --- Database Connection Pool ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Helper function to get an ID from the 'trailers' table or insert a new record if it doesn't exist.
 * This is kept as trailer_id is a foreign key in trailer_inventory.
 */
async function getOrInsertId(connection, tableName, uniqueCol, value, additionalCols = {}) {
    // Determine the actual primary key column name based on the table name
    let pkColumnName;
    switch (tableName) {
        case 'trailers':
            pkColumnName = 'trailer_id';
            break;
        case 'locations': // Included for robustness, though not used in this specific script
            pkColumnName = 'location_id';
            break;
        case 'products': // Included for robustness, though not used in this specific script
            pkColumnName = 'product_id';
            break;
        default:
            pkColumnName = `${tableName}_id`;
            break;
    }

    // --- SELECT part ---
    let [rows] = await connection.execute(`SELECT ${pkColumnName} FROM ${tableName} WHERE ${uniqueCol} = ?`, [value]);

    if (rows.length > 0) {
        return rows[0][pkColumnName]; // Return the value using the correct PK column name
    } else {
        // --- INSERT part ---
        const cols = [uniqueCol, ...Object.keys(additionalCols)].join(',');
        const placeholders = Array(Object.keys(additionalCols).length + 1).fill('?').join(',');
        const values = [value, ...Object.values(additionalCols)];

        const [result] = await connection.execute(`INSERT INTO ${tableName} (${cols}) VALUES (${placeholders})`, values);
        console.log(`Inserted new ${tableName}: ${value} (PK: ${result.insertId})`);
        return result.insertId;
    }
}

/**
 * Main function to import only inventory_data.json.
 */
async function importInventoryDataOnly() {
    let connection; // Declare connection outside try-block for finally-block access
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        await connection.beginTransaction(); // Start a transaction for atomicity

        console.log('Starting inventory data import...');

        // --- Process inventory_data.json ---
        console.log('Processing inventory_data.json...');
        const inventoryDataRaw = await fs.readFile('./data/inventory_data.json', 'utf8');
        const inventoryData = JSON.parse(inventoryDataRaw);

        for (const item of inventoryData) {
            const trailerId = await getOrInsertId(connection, 'trailers', 'trailer_number', item["Trailer "].trim());
            const locationState = item["Location "].trim();

            // Extract the raw string values for Midas #1 and Midas #2
            // Ensure they are treated as strings and trim whitespace, or null if missing
            const midas1Value = item["Midas #1"] ? String(item["Midas #1"]).trim() : null;
            const midas2Value = item["Midas #2"] ? String(item["Midas #2"]).trim() : null;

            // Use ON DUPLICATE KEY UPDATE for upserting inventory (based on trailer_id UNIQUE constraint)
            await connection.execute(
                `INSERT INTO trailer_inventory (trailer_id, midas_1_value, midas_2_value, location_state)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    midas_1_value = VALUES(midas_1_value),
                    midas_2_value = VALUES(midas_2_value),
                    location_state = VALUES(location_state),
                    last_updated_at = NOW()`, // Update timestamp on conflict
                [trailerId, midas1Value, midas2Value, locationState]
            );
        }
        console.log('Finished processing inventory_data.json.');


        await connection.commit(); // Commit the transaction if all inserts succeed
        console.log('Inventory data imported successfully and committed!');

    } catch (err) {
        console.error('ERROR during inventory data import:', err);
        if (connection) {
            await connection.rollback(); // Rollback if any error occurs
            console.log('Transaction rolled back due to error.');
        }
        process.exit(1); // Exit with error code
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
        pool.end(); // Close the pool when all operations are done
    }
}

// Execute the import function
importInventoryDataOnly();