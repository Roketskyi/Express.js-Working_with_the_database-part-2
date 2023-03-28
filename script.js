const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Підключення до БД | Завдання 0
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'ukd_admin',
  host: 'ep-square-mouse-262994.us-west-2.aws.neon.tech',
  database: 'ukd',
  password: 'YyfeQqL0W8uS',
  port: 5432,
  ssl: true
})

app.get('/', (req, res) => {
  pool.query('SELECT * FROM "tasks"', (error, results) => {
    if (error) throw error

    res.status(200).json(results.rows)
  })
});

// Створити APi-endpoint для додавання записів у табличку students | Завдання 1
app.post('/students', (req, res) => {
  const { first_name, last_name, age } = req.body;

  pool.query(
    'INSERT INTO students (first_name, last_name, age) VALUES ($1, $2, $3)',
    [first_name, last_name, age],
    (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.status(201).send('Student added successfully');
      }
    }
  );
});

// Створити APi-endpoint для додавання у табличку tasks з прив'язкою до студента і предмету | Завдання 2
app.post('/tasks', (req, res) => {
  const { student_id, description, mark, subject_id } = req.body;

  pool.query(
    'INSERT INTO tasks (student_id, description, mark, subject_id) VALUES ($1, $2, $3, $4)',
    [student_id, description, mark, subject_id],
    (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.status(201).send('Task added successfully');
      }
    }
  );
});

// Створити APi-endpoint для отримання списку студентів з таблиці students з приєднаними до них списками завдань з таблиці tasks | Завдання 3
app.get('/join', (req, res) => {
  pool.query(
    `SELECT students.id, students.first_name, students.last_name, students.age, tasks.id AS task_id, tasks.description as task_description, tasks.mark as task_mark, subjects.name as subject_name
    FROM students
    LEFT JOIN tasks ON students.id = tasks.student_id
    LEFT JOIN subjects ON tasks.subject_id = subjects.id
    ORDER BY students.id`,
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
              first_name: row.first_name,
              last_name: row.last_name,
              age: row.age,
              tasks: [],
            });
          }

          if (row.task_id) {
            students[students.length - 1].tasks.push({
              id: row.task_id,
              description: row.task_description,
              mark: row.task_mark,
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