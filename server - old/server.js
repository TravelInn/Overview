const express = require('express');
const db = require('../database/index.js');

const app = express();
const port = process.env.PORT || 3002;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('public'));
app.use('/:id', express.static('public'));

const getAvgRating = ((reviews) => {
  const sum = reviews.reduce((acc, review) => (
    { rating: acc.rating + review.rating }
  ));
  const avg = sum.rating / reviews.length;
  return Math.round(avg * 10) / 10;
});

const getKeyword = ((rating) => {
  let keyword;
  if (rating <= 10 && rating > 9) {
    keyword = 'Superb';
  } else if (rating <= 9 && rating > 8) {
    keyword = 'Fabulous';
  } else if (rating <= 8 && rating > 7) {
    keyword = 'Very Good';
  } else if (rating <= 7 && rating > 6) {
    keyword = 'Good';
  } else {
    keyword = 'Good';
  }
  return keyword;
});

const getTopFeatureCounts = ((reviews) => {
  const topFeatureCounts = {};
  reviews.forEach((review) => {
    if (topFeatureCounts[review.topFeature]) {
      topFeatureCounts[review.topFeature] += 1;
    } else {
      topFeatureCounts[review.topFeature] = 1;
    }
  });
  delete topFeatureCounts.Bummer;
  return Object.entries(topFeatureCounts);
});

const sortTopFeatures = (topFeatures => (
  topFeatures.sort((a, b) => (a.order - b.order))
));

const generateTopFeatures = ((reviews) => {
  const topFeatureCounts = getTopFeatureCounts(reviews);
  const topFeaturesWithKeywords = topFeatureCounts.map((topFeatureCount) => {
    const feature = topFeatureCount[0];
    const count = topFeatureCount[1];
    let ratingFactor;
    let order;
    if (feature === 'Location') {
      if (count > 1) {
        ratingFactor = 'Perfect';
      } else {
        ratingFactor = 'Wonderful';
      }
      order = 1;
      return { order, feature, ratingFactor };
    } else if (feature === 'Staff') {
      if (count > 1) {
        ratingFactor = 'Superb';
      } else {
        ratingFactor = 'Marvellous';
      }
      order = 2;
      return { order, feature, ratingFactor };
    } else if (feature === 'Cleanliness') {
      if (count > 1) {
        ratingFactor = 'Fantastic';
      } else {
        ratingFactor = 'Excellent';
      }
      order = 3;
      return { order, feature, ratingFactor };
    }
    return { order, feature, ratingFactor };
  });

  return sortTopFeatures(topFeaturesWithKeywords);
});

app.get('/api/overview/:id', async (req, res) => {
  try {
    const searchId = Number(req.params.id);
    const hostel = await db.Hostel.findOne({
      id: searchId,
    });
    const rating = getAvgRating(hostel.reviews);
    const keyword = getKeyword(rating);
    const totalReviews = hostel.reviews.length;
    const topFeatures = generateTopFeatures(hostel.reviews);
    hostel.reviews = undefined;
    res.send({
      hostel,
      rating,
      keyword,
      totalReviews,
      topFeatures,
    });
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.get('/api/hostels', async (req, res) => {
  try {
    const locations = await db.Location.find();
    res.send(locations);
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.get('/api/hostels/:id/info', async (req, res) => {
  try {
    let hostel;
    let rating;
    let keyword;
    let totalReviews;
    let topFeatures;
    if (req.params.id === 'undefined') {
      hostel = await db.Hostel.findOne();
      rating = getAvgRating(hostel.reviews);
      keyword = getKeyword(rating);
      totalReviews = hostel.reviews.length;
      topFeatures = generateTopFeatures(hostel.reviews);
    } else {
      hostel = await db.Hostel.find({
        location_id: req.params.id,
      });
      const min = 0;
      const max = hostel.length - 1;
      const i = Math.floor((Math.random() * ((max - min) + 1)) + min);
      hostel = hostel[i];
      rating = getAvgRating(hostel.reviews);
      keyword = getKeyword(rating);
      totalReviews = hostel.reviews.length;
      topFeatures = generateTopFeatures(hostel.reviews);
    }
    hostel.reviews = undefined;
    res.send({
      hostel,
      rating,
      keyword,
      totalReviews,
      topFeatures,
    });
  } catch (error) {
    res.status(404).send(`ERROR: ${error}`);
  }
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});

