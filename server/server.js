require('newrelic');

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
//const morgan = require('morgan');

console.log('ENV:', process.env.NODE_ENV);

const pool = new Pool({
  user: 'alexromanak',
  host: '127.0.0.1',
  database: 'testdb',
  password: '',
  max: 100,
  port: 5432,
});

const app = express();
const port = process.env.PORT || 3006;

app.use(bodyParser.json());
//app.use(morgan('combined'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

////////////////////////////////////////////////////////////////////////////////////
// Helper Functions

const getKeyword = ((rating) => {
  let keyword = 'Good';
  if (rating <= 10 && rating > 7) {
    keyword = 'Superb';
  } else if (rating <= 7 && rating > 6) {
    keyword = 'Fabulous';
  } else if (rating <= 6 && rating > 5) {
    keyword = 'Very Good';
  } 
  return keyword;
});

const generateTopFeatures = () => {
  const random1 = Math.random();
  const random2 = Math.random();
  const random3 = Math.random();

  const locationDescription = random1 > .5 ? 'Perfect' : 'Wonderful';
  const staffDescription = random2 > .5 ? 'Superb' : 'Marvellous';
  const cleanDescription = random3 > .5 ? 'Fantastic' : 'Excellent';

  const obj1 = {
    order: 1,
    feature: 'Location',
    ratingFactor: locationDescription
  };
  const obj2 = {
    order: 2,
    feature: 'Staff',
    ratingFactor: staffDescription
  };
  const obj3 = {
    order: 3,
    feature: 'Cleanliness',
    ratingFactor: cleanDescription
  };

  return [obj1, obj2, obj3];
}

////////////////////////////////////////////////////////////////////////////////////
// API Paths

// app.use(express.static('public'));
// app.use('/:id', express.static('public'));

app.get('/api/overview/:id', async (req, res) => {
  //console.log('hit! specific hostel');
  try {

    // need to add error handling for hostel id that doesn't exist

    const query = `
    SELECT htable.id, name, description, avg_rating, urls.array AS photos, totalReivews
    FROM hostel AS htable
    INNER JOIN 
      (SELECT hostelid, AVG(rating) AS avg_rating, COUNT(rating) as totalReivews
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

    pool.query({
      name: 'return-hostel-info',
      text: query,
      values: [req.params.id],
    })
      .then(data => {
        res.status(200).send({
          "hostel": data.rows[0],
          "rating": data.rows[0].avg_rating,
          "keyword": getKeyword(data.rows[0].avg_rating),
          "totalReviews": 20,
          "topFeatures": generateTopFeatures(),
        })
      });
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);3
  }
});

app.get('/api/hostels', async (req, res) => {
  //console.log('hit! locations');
  try {

    const query = `SELECT city, country FROM location WHERE ID > $1 LIMIT 20;`;

    pool.query({
      name: 'return-set-of-locations',
      text: query,
      values: [Math.floor(Math.random() * 999980) + 1],
    })
      .then(data => {
        res.status(200).send(data.rows[0])
      });

  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.get('/api/overview/:id', async (req, res) => {
  //console.log('hit! specific hostel');
  try {

    // for now, just returning a random hostel
    // in the future, should refactor to be a random selection from hostels with locationid of input

    const query = `
    SELECT htable.id, name, description, avg_rating, urls.array AS photos, totalReivews
    FROM hostel AS htable
    INNER JOIN 
      (SELECT hostelid, AVG(rating) AS avg_rating, COUNT(rating) as totalReivews
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

    pool.query({
      name: 'return-hostel-info',
      text: query,
      values: [Math.floor(Math.random() * 10000000) + 1],
    })
      .then(data => {
        res.status(200).send({
          "hostel": data.rows[0],
          "rating": data.rows[0].avg_rating,
          "keyword": getKeyword(data.rows[0].avg_rating),
          "totalReviews": 20,
          "topFeatures": generateTopFeatures(),
        })
      });
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);3
  }
});

app.post('/api/reviews/add', async (req, res) => {
  //Example format of what the body of a request could look like:
  //Notice: JSON
  /*
    {
      "rating": 5,
      "topFeature": "Unbelievable",
      "hostelid": 3412912
    }
  */

  const values = [req.body.rating, req.body.topFeature, req.body.hostelid];
  
  try {
    const query = `INSERT INTO review VALUES (DEFAULT, $1, $2, $3)`;
    pool.query({
      name: 'add-new-review',
      text: query,
      values: values,
    })
      .then(data => res.send(data));
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});