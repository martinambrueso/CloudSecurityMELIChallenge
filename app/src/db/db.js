const mysql = require("mysql");

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
	user: process.env.MYSQL_USER || 'root',
	password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'csmeli'
});

// open the MySQL connection
connection.connect(error => {
    if (error) {
        throw error;
    }
    console.log("Successfully connected to the database."); 
});

module.exports = connection;