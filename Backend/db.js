import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: process.env.HOST || localhost,
  user: process.env.USER || root,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
    if (err) {
        console.error(`Error connecting to database: ${err.message}`);
        return;
    }
    console.log(`Database Connected: ${db.authorized} \nConnection ID: ${db.threadId}`);
});

export default db;