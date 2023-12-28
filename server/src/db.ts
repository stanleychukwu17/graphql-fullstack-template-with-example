import {MongoClient} from 'mongodb'
const Pool = require('pg').Pool

// define the type of callback function
type callbackFn = (info?:any) => void

// declaration of variables to be used/updated
let dbConnection: any
let dbUrl:string = 'mongodb://localhost:27017/bookstore'


    // for mongodb
export const connectToDb = (cb: callbackFn) => {
    MongoClient.connect(dbUrl)
    .then(client => {
        dbConnection = client.db()
        return cb()
    })
    .catch(err => {
        return cb(err)
    })
}

export const getDb = () => dbConnection;

// for postgres
export const pool = new Pool({
    'user': process.env.DB_USER,
    'password': process.env.DB_PASSWD,
    'database': process.env.DB,
    'host': process.env.HOST,
    'port':process.env.DB_PORT
})