const express = require('express');
const app = express();
const port = 3000;

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'ukd_student',
  host: '0.tcp.ngrok.io',
  database: 'ukd_db',
  password: 'password',
  port: 11439,
})

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) throw error

    response.status(200).json(results.rows)
  })
}

// Створення таблиці
const createTable = (request, response) => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS "students_Roketskyi" (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      age INTEGER
    );`,

    (error, results) => {
      if (error) throw error;

      response.status(200).json(results.rows)
      console.log('Таблиця успішно створена');
    }
  );
}


// Створення юзера
const createUser = (request, response) => {
  const { first_name, last_name, age } = { first_name: 'roman', last_name: 'roket', age: 12}

  pool.query(`INSERT INTO students_Roketskyi (first_name, last_name, age) VALUES ($1, $2, $3) RETURNING *`, 
  [first_name, last_name, age], (error, results) => {
    if (error) {
      throw error
    }

    response.status(201).send(`User added with ID: ${results.rows[0].id}`)
  })
}

app.get('/', (req, res) => {
  getUsers(req, res);
});

app.get('/createUser', (req, res) => {
  createUser(req, res);
});

app.get('/create', (req, res) => {
  createTable(req, res);
});

app.listen(port, () => {
    console.log(`Веб-сервер був запущений на порту ${port}`);
});
