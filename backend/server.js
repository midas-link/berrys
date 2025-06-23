

require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0        
});

pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database (AWS RDS)!');
        connection.release(); 
    })
    .catch(err => {
        console.error('ERROR: Could not connect to MySQL database:', err.message);
        process.exit(1);
    });

    app.get('/api/Site_Data', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT
                    e.event_id,
                    e.event_timestamp,
                    e.tank_number,
                    e.event_type,
                    FROM_UNIXTIME(e.delivery_start_time_epoch) AS "Delivery Start",
                    FROM_UNIXTIME(e.delivery_end_time_epoch) AS "Delivery End",
                    l.address AS Address,
                    l.zip_code AS Zip,
                    l.site_code AS SiteCode,
                    l.business_unit_name AS BusinessUnitName,
                    l.city AS City,
                    l.state AS State,
                    t.trailer_number AS "Trailer No.",
                    pd.grade_name AS "Delivered"
                FROM
                    events AS e
                JOIN
                    locations AS l ON e.location_id = l.location_id
                JOIN
                    trailers AS t ON e.trailer_id = t.trailer_id
                LEFT JOIN
                    products AS pd ON e.delivered_product_id = pd.product_id
                WHERE
                      e.event_type = 'Delivery'
                ORDER BY
                    e.event_timestamp DESC;
            `);
            res.json(rows);
        } catch (err) {
            console.error('Error fetching filtered events:', err.message);
            res.status(500).json({ error: 'Failed to retrieve filtered events' });
        }
    });
    app.get('/api/Vehicle_Logging', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT
                    e.event_id,
                    e.event_timestamp,
                    e.tank_number,
                    e.event_type,
                    FROM_UNIXTIME(e.delivery_start_time_epoch) AS delivery_start_time,
                    FROM_UNIXTIME(e.delivery_end_time_epoch) AS delivery_end_time,
                    l.address AS Address,
                    l.city AS City,
                    l.state AS State,
                    t.trailer_number AS "Trailer No.",
                    pd.grade_name AS "Delivered",
                    pp.grade_name AS "Prevented Delivery "
                FROM
                    events AS e
                JOIN
                    locations AS l ON e.location_id = l.location_id
                JOIN
                    trailers AS t ON e.trailer_id = t.trailer_id
                LEFT JOIN
                    products AS pd ON e.delivered_product_id = pd.product_id
                LEFT JOIN
                    products AS pp ON e.prevented_product_id = pp.product_id
                WHERE
                    e.event_type = 'Prevented Delivery' 
                ORDER BY
                    e.event_timestamp DESC;
            `);
            res.json(rows);
        } catch (err) {
            console.error('Error fetching filtered events:', err.message);
            res.status(500).json({ error: 'Failed to retrieve filtered events' });
        }
    });
    app.get('/api/Cross_Drops', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT
                    e.event_id,
                    e.event_timestamp,
                    e.tank_number AS tankNo,
                    e.event_type,
                    FROM_UNIXTIME(e.delivery_start_time_epoch) AS delivery_start_time,
                    FROM_UNIXTIME(e.delivery_end_time_epoch) AS delivery_end_time,
                    l.address AS Address,
                    l.zip_code AS Zip,
                    l.city AS City,
                    l.state AS State,
                    t.trailer_number AS "Trailer No.",
                    pd.grade_name AS "Delivered",
                    pp.grade_name AS "Prevented Delivery "
                FROM
                    events AS e
                JOIN
                    locations AS l ON e.location_id = l.location_id
                JOIN
                    trailers AS t ON e.trailer_id = t.trailer_id
                LEFT JOIN
                    products AS pd ON e.delivered_product_id = pd.product_id
                LEFT JOIN
                    products AS pp ON e.prevented_product_id = pp.product_id
                WHERE
                    e.event_type = 'Cross Drop' 
                ORDER BY
                    e.event_timestamp DESC;
            `);
            res.json(rows);
        } catch (err) {
            console.error('Error fetching filtered events:', err.message);
            res.status(500).json({ error: 'Failed to retrieve filtered events' });
        }
    });
    app.get('/api/Vehicle_Logs/:trailerNumber', async (req, res) => {
        const trailerNumber = req.params.trailerNumber; // Get trailerNumber from URL parameter
        try {
            const [rows] = await pool.query(`
                SELECT
                    e.event_id,
                    e.event_timestamp,
                    e.tank_number AS "Tank No. ", -- Renamed to match old JSON
                    e.event_type,
                    FROM_UNIXTIME(e.delivery_start_time_epoch) AS "Delivery Start ", -- Converted from epoch
                    FROM_UNIXTIME(e.delivery_end_time_epoch) AS "Delivery End",     -- Converted from epoch
                    l.address AS Address,
                    l.city AS City,
                    l.state AS State,
                    l.zip_code AS Zip, -- Important for openDetails
                    t.trailer_number AS "Trailer No.", -- Important for matching the URL param
                    pd.grade_name AS "Delivered",
                    pp.grade_name AS "Prevented Delivery "
                FROM
                    events AS e
                JOIN
                    trailers AS t ON e.trailer_id = t.trailer_id
                JOIN
                    locations AS l ON e.location_id = l.location_id
                LEFT JOIN
                    products AS pd ON e.delivered_product_id = pd.product_id
                LEFT JOIN
                    products AS pp ON e.prevented_product_id = pp.product_id
                WHERE
                    t.trailer_number = ? -- Filter by the trailer number from the URL
                ORDER BY
                    e.event_timestamp DESC; -- Or ASC, depending on desired timeline order
            `, [trailerNumber]); 
    
            res.json(rows);
        } catch (err) {
            console.error(`Error fetching vehicle logs for trailer ${trailerNumber}:`, err.message);
            res.status(500).json({ error: 'Failed to retrieve vehicle logs' });
        }
    });
    

app.get('/api/trailers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM trailers');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching trailers:', err);
        res.status(500).json({ error: 'Failed to retrieve trailers' });
    }
});

app.get('/api/locations', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM locations');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: 'Failed to retrieve locations' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to retrieve products' });
    }
});

app.get('/api/Inventory', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
            ti.inventory_id,
                ti.trailer_id,
                t.trailer_number AS "Trailer",      
                ti.midas_1_value AS "Midas #1",
                ti.midas_2_value AS "Midas #2",
                ti.location_state AS "Location",
                ti.last_updated_at
            FROM
                trailer_inventory AS ti
            JOIN
                trailers AS t ON ti.trailer_id = t.trailer_id;
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: 'Failed to retrieve inventory' });
    }
});


app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});