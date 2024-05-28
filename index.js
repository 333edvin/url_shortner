const express = require('express');
const path = require('path');
const app = express();

const { connectToMongoDb } = require('./connection');

const PORT = 8000;

const urlRoute = require('./routes/url');

const URL = require('./Models/url');

connectToMongoDb('mongodb+srv://edvinjohnson333:shorturls2024@cluster0.aszn2gk.mongodb.net/short-url?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.get('/test', async (req, res) => {
  const allUrls = await URL.find({});
  return res.render('homw',{
    urls:allUrls,
  });
});

app.use('/url', urlRoute);

app.use('/:shortid', async (req, res) => {
  const shortId = req.params.shortid;
  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // This option returns the modified document
    );

    if (entry) {
      res.redirect(entry.redirectURL);
    } else {
      res.status(404).send('Short URL not found');
    }
  } catch (err) {
    console.error('Error finding and updating URL:', err);
    res.status(500).send('Internal server error');
  }
});

app.listen(PORT, () => console.log("Server started at PORT " + PORT));
