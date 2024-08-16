import { pool } from '../db'
import {show_bad_message, show_good_message} from '../functions/utils'

export async function createTables() {
    let we:string

    try {
        // gender enum type
        const gender_enum_type = `
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
                    CREATE TYPE gender_enum AS ENUM ('male', 'female');
                END IF;
            END $$;
        `
        await pool.query(gender_enum_type);

        // users table
        const create_users_table_query = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(60) NOT NULL,
                gender gender_enum NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(create_users_table_query);

        // users session table
        const create_users_session_table_query = `
            CREATE TABLE IF NOT EXISTS users_session (
                id SERIAL PRIMARY KEY,
                fake_id INT NOT NULL,
                user_id INT NOT NULL,
                active VARCHAR(3) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(create_users_session_table_query);

        return show_good_message()
    } catch (err:any) {
        throw new Error(`Error creating tables ${err.message}`)
    }

}