import express from "express";
import bodyParser from "body-parser";
import {dirname} from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import env from "dotenv";
import moment from 'moment';



const app = express();
const port = 3000;
const __dirname=dirname(fileURLToPath(import.meta.url));

env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
db.connect();

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// app.post("/submit_code", (req,res)=> {
//     res.sendFile(__dirname + "/public/table.html");
// });

// app.post('/submit_code', async (req, res) => {
//     try {
//       const { username, code_language, stdin, source_code } = req.body;
  
//       // Create a new submission in the database
//       const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
//       const query = {
//         text: 'INSERT INTO submissions (username, code_language, stdin, source_code, timestamp) VALUES ($1, $2, $3, $4, $5)',
//         values: [username, code_language, stdin, source_code, timestamp],
//       };
//       await db.query(query);
  
//       // Redirect to submissions page
//       res.sendFile(__dirname + "/public/table.html");
//     } catch (error) {
//       console.error('Error submitting code:', error);
//       res.status(500).send('Error submitting code. Please try again later.');
//     }
//   });

//   app.post('/submit_code', async (req, res) => {
//     try {
//       const { username, code_language, stdin, source_code } = req.body;
  
//       // Get the user_id associated with the username
//       const userQuery = {
//         text: 'SELECT user_id FROM users WHERE username = $1',
//         values: [username],
//       };
//       const userResult = await db.query(userQuery);
//       const user_id = userResult.rows[0].user_id;
  
//       // Create a new submission in the database
//       const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
//       const submissionQuery = {
//         text: 'INSERT INTO submissions (user_id, code_language, stdin, source_code, timestamp) VALUES ($1, $2, $3, $4, $5)',
//         values: [user_id, code_language, stdin, source_code, timestamp],
//       };
//       await db.query(submissionQuery);
  
//       // Redirect to submissions page
//       res.sendFile(__dirname + "/public/table.html");
//     } catch (error) {
//       console.error('Error submitting code:', error);
//       res.status(500).send('Error submitting code. Please try again later.');
//     }
//   });
app.post('/submit_code', async (req, res) => {
    try {
      const { username, code_language, stdin, source_code } = req.body;
  
      // Check if the username already exists in the users table
      const userQuery = {
        text: 'SELECT user_id FROM users WHERE username = $1',
        values: [username],
      };
      const userResult = await db.query(userQuery);
      let user_id;
  
      if (userResult.rows.length === 0) {
        // Username does not exist, so insert it into the users table
        const insertUserQuery = {
          text: 'INSERT INTO users (username) VALUES ($1) RETURNING user_id',
          values: [username],
        };
        const insertedUserResult = await db.query(insertUserQuery);
        user_id = insertedUserResult.rows[0].user_id;
      } else {
        // Username already exists, get the user_id
        user_id = userResult.rows[0].user_id;
      }
  
      // Create a new submission in the database
      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      const submissionQuery = {
        text: 'INSERT INTO submissions (user_id, code_language, stdin, source_code, timestamp) VALUES ($1, $2, $3, $4, $5)',
        values: [user_id, code_language, stdin, source_code, timestamp],
      };
      await db.query(submissionQuery);
  
      // Redirect to submissions page
      res.sendFile(__dirname + "/public/table.html");
    } catch (error) {
      console.error('Error submitting code:', error);
      res.status(500).send('Error submitting code. Please try again later.');
    }
  });

  
  

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});