/**

const { pool } = require('./db'); // Assuming your pool is exported from another file

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Example: Create a users table if it does not exist
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute the query
    await client.query(createUsersTableQuery);
    console.log("Users table created or already exists.");
    
    // Add more table creation queries here as needed
    // ...

  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    client.release(); // Release the client back to the pool
  }
};

// Call the function to create tables
createTables()
  .then(() => console.log('Migration completed.'))
  .catch(err => console.error('Migration failed:', err));

*/

// import { errorLogger, log } from '../logger/';
// import {userRegisterInfo, userLoginInfo} from '../types/users'

import { pool } from '../db'
import {show_bad_message, show_good_message} from '../functions/utils'

export async function createTables() {
}