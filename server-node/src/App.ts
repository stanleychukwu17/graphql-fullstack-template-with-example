//--START-- importation fo assets
import express, {Express} from 'express'
import cors from 'cors'
require('dotenv').config()
const {pool} = require('./db')

import gql from "graphql-tag";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone'
import { buildSubgraphSchema } from '@apollo/subgraph';
import { expressMiddleware } from '@apollo/server/express4';
import { readFileSync } from "fs";
import path from "path";
import resolvers from './graphql/resolvers';

import routes from './routes'
import deserializeUser from './middleware/deserializeUser'

// for the error logger
import {log, errorLogger} from './logger'
import { get_the_line_where_this_error_occurred } from './functions/utils'
import {createTables} from './controllers/dbMigrate.controllers'
//--END--


//* verify that a port for the backEnd is provided
const port = process.env.PORT
if (port === undefined || port === '') {
    throw new Error('Server startup failed: No port specified. Please set the PORT environment variable and try again.');
}

//* creates an express app
const app = express();

//* Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies and HTTP authentication
    optionsSuccessStatus: 204, // Set the status for successful preflight requests
}))
app.use(deserializeUser); // checks to see if the user is a has a valid accessToken or refreshToken


//* how to log errors for debugging purposes
const logError = () => {
    // below is how to use the logger to log both errors and information, we have .info, .error, .warn, and .debug methods
    errorLogger.info({stanley:'my  name is stanley', lastName: 'my last name is chukwu'})

    const error = new Error('Error occurred').stack!; // this will help me to get the line where the error occurred, then we will use regular expression to capture only the information that wee need
    const capturedErrorLine = get_the_line_where_this_error_occurred({errorMessage: error})
    errorLogger.error({'lineNumber': capturedErrorLine}, 'see error message 2')
}
// logError()

//* starts the apollo server
async function startApolloServer (app: Express) {
    // Get the absolute path to the schema file
    const schemaFilePath = path.join(__dirname, 'graphql', 'schema.graphql');

    try {
        // Read the contents of the file synchronously
        const schemaContent = readFileSync(schemaFilePath, 'utf-8');
      
        // Parse the schema using gql
        const typeDefs = gql(schemaContent);
      
        // starts the apollo server
        const server = new ApolloServer({
            schema: buildSubgraphSchema({ typeDefs, resolvers }),
        });

        // Note you must call `start()` on the `ApolloServer` instance before passing the instance to `expressMiddleware`
        await server.start();

        // adds graphql to the express server
        app.use('/graphql', expressMiddleware(server) );
    } catch (err) {
        console.error('Error reading or parsing the file:', err);
    }

    console.log(`graphql server up and running at: http://localhost:${port}/graphql`);
}
startApolloServer(app)

//* connect to the postgres database and then allow express to receive request
pool.connect((err: any, client: any, release: () => void) => {
    if (err) {
        return console.log('Error connecting to the postgresSQL database, because: ', err.stack)
    }

    // listen to requests on 
    app.listen(port, async () => {
        console.log(`now listening to request from port ${port}`)

        // Call the function to create tables
        createTables()
            .then(() => console.log('Migration of database tables completed.'))
            .catch(err => console.error('Migration of database tables failed:', err.message));

        routes(app)
    })

    release()
})