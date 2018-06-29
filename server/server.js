const express = require('express');
const pgp = require('pg-promise')(/*options*/);
const db = pgp('postgres://alexromanak@127.0.0.1:5432/testdb');

const app = express();
const port = process.env.PORT || 3005;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// app.use(express.static('public'));
// app.use('/:id', express.static('public'));

app.get('/api/overview/:id', async (req, res) => {
  try {

    // need to add error handling for hostel id that doesn't exist

    const query = `
    SELECT htable.id, name, description, avg_rating, urls.array
    FROM hostel AS htable
    INNER JOIN 
      (SELECT hostelid, AVG(rating) AS avg_rating
      FROM review
      WHERE hostelid=$1
      GROUP BY hostelid)
      AS rtable 
      ON htable.id = rtable.hostelid
      INNER JOIN
        (SELECT $1 AS id, 
        ARRAY
          (SELECT url
          FROM 
            (SELECT UNNEST(photosarrayids)
            FROM hostel
            WHERE id = $1)
            AS photoidtable
            INNER JOIN
              photos
              ON photoidtable.unnest = photos.id)
      ) 
    AS urls ON urls.id = htable.id`;

    db.one({
      name: 'return-hostel-info',
      text: query,
      values: req.params.id,
    })
      .then(data => res.send(data));
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.get('/api/hostels', async (req, res) => {
  try {

    const query = `SELECT city, country FROM location WHERE ID > $1 LIMIT 20;`;

    db.any({
      name: 'return-set-of-locations',
      text: query,
      values: Math.floor(Math.random() * 999980) + 1,
    })
      .then(data => res.send(data));

  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.get('/api/hostels/:id/info', async (req, res) => {
  try {

    // for now, just returning a random hostel
    // in the future, should refactor to be a random selection from hostels with locationid of input

    const query = `
    SELECT htable.id, name, description, avg_rating, urls.array
    FROM hostel AS htable
    INNER JOIN 
      (SELECT hostelid, AVG(rating) AS avg_rating
      FROM review
      WHERE hostelid=$1
      GROUP BY hostelid)
      AS rtable 
      ON htable.id = rtable.hostelid
      INNER JOIN
        (SELECT $1 AS id, 
        ARRAY
          (SELECT url
          FROM 
            (SELECT UNNEST(photosarrayids)
            FROM hostel
            WHERE id = $1)
            AS photoidtable
            INNER JOIN
              photos
              ON photoidtable.unnest = photos.id)
      ) 
    AS urls ON urls.id = htable.id`;

    db.one({
      name: 'return-hostel-info',
      text: query,
      values: Math.floor(Math.random() * 10000000) + 1,
    })
      .then(data => res.send(data));
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});