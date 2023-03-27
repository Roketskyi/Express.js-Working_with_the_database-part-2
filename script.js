const express = require('express');
const app = express();
const port = 3000;

// Підключення до БД
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: '0808',
  port: 5432
})

app.get('/', (req, res) => {
  res.send('Hi')
})

app.post('/students', (req, res) => {
  const { name, email } = req.body;

  pool.query(
    'INSERT INTO students (name, email) VALUES ($1, $2)',
    [name, email],
    (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.status(201).send('Student added successfully');
      }
    }
  );
});

app.post('/tasks', (req, res) => {
  const { title, description, student_id, subject_id } = req.body;

  pool.query(
    'INSERT INTO tasks (title, description, student_id, subject_id) VALUES ($1, $2, $3, $4)',
    [title, description, student_id, subject_id],
    (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.status(201).send('Task added successfully');
      }
    }
  );
});

app.get('/students/tasks', (req, res) => {
  pool.query(
    'SELECT students.id, students.name, students.email, tasks.id as task_id, tasks.title as task_title, tasks.description as task_description, subjects.name as subject_name FROM students LEFT JOIN tasks ON students.id = tasks.student_id LEFT JOIN subjects ON tasks.subject_id = subjects.id ORDER BY students.id',
    (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        const students = [];

        results.rows.forEach((row) => {
          const student = students.find((s) => s.id === row.id);

          if (!student) {
            students.push({
              id: row.id,
              name: row.name,
              email: row.email,
              tasks: [],
            });
          }

          if (row.task_id) {
            students[students.length - 1].tasks.push({
              id: row.task_id,
              title: row.task_title,
              description: row.task_description,
              subject_name: row.subject_name,
            });
          }
        });

        res.send(students);
      }
    }
  );
});


app.listen(port, () => {
  console.log(`Веб-сервер був запущений за наступним посиланням: http://localhost:${port}/`);

  pool.connect((error) => {
    if (error) {
      console.error(`Error connecting to database ${error}`);
    } else {
      console.log('Connected to database');
    }
  });
});
