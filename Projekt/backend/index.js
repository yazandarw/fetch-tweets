
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Twit = require("twit");
const { json } = require("body-parser");
const TweetModel = require("./TweetModel");
const usrModel = require("./UserModel");
const UserModel = require("./UserModel");
const searchModel = require("./SearchModel");
const jwt = require("jsonwebtoken");
const getUserEmailFromJwtToken = require("./getUserEmailFromJwtToken");

const T = new Twit({
  consumer_key: "",    // Here you must enter ACCESS TOKEN from Twitter API
  consumer_secret: "",    // Here you must enter the ACCESS TOKEN SECRET from Twitter API
  timeout_ms: 60 * 1000,
  strictSSL: true,
  app_only_auth: true,
});

const app = new express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/search", async (req, res) => {
  if (await TweetModel.findOne({ query: req.query.q })) {
    const tweeData = await TweetModel.findOne({ query: req.query.q });
    const lastFectTimeInSeconds = tweeData.timeStamp / 1000;
    const SECOND_IN_5_MINUTES = 300;
    const TimeDiff = Date.now() / 1000 - lastFectTimeInSeconds;

    if (TimeDiff / 100 < SECOND_IN_5_MINUTES) {
      res.send(tweeData.data);
    } else {
      T.get(
        "search/tweets",
        { q: req.query.q, count: 100, lang: "en", tweet_mode: "extended " },
        async function (err, data, response) {
          const respons = [];
          data.statuses.forEach((element, i) => {
            respons[i] = {};
            respons[i].tweet = element.text;
            respons[i].date = element.created_at;

            respons[i].hashs = [];
            element.entities.hashtags.forEach((element) => {
              respons[i].hashs[0] = element.text;
            });
            console.log(respons[i].hashs);

            if (element.entities.media) {
              respons[i].img = element.entities.media[0].media_url_https;
              console.log(respons[i].img);
            }
            respons[i].username = element.user.name;
            respons[i].profileimg = element.user.profile_image_url_https;
          });
          const tweetToSave = new TweetModel({
            query: req.query.q,
            data: respons,
            timeStamp: Date.now(),
          });
          await tweetToSave.save();
          res.json(respons);
        }
      );
    }
  } else {
    T.get(
      "search/tweets",
      { q: req.query.q, count: 100, lang: "en", tweet_mode: "extended " },
      async function (err, data, response) {
        const respons = [];
        data.statuses.forEach((element, i) => {
          respons[i] = {};
          respons[i].tweet = element.text;
          respons[i].date = element.created_at;

          respons[i].hashs = [];
          element.entities.hashtags.forEach((element) => {
            respons[i].hashs[0] = element.text;
          });
          console.log(respons[i].hashs);

          if (element.entities.media) {
            respons[i].img = element.entities.media[0].media_url_https;
            console.log(respons[i].img);
          }

          respons[i].username = element.user.name;
          respons[i].profileimg = element.user.profile_image_url_https;
        });
        const tweetToSave = new TweetModel({
          query: req.query.q,
          data: respons,
          timeStamp: Date.now(),
        });

        await tweetToSave.save();
        res.json(respons);
      }
    );
  }
});

app.post("/register", async (req, res) => {
  const userWithEmail = await usrModel.findOne({ email: req.body.email });
  console.log(userWithEmail);
  if (!userWithEmail) {
    const newUser = new UserModel(req.body);
    await newUser.save();
    jwt.sign(req.body, "Jjjjjpokaoijajoaonioaajabuhauabuhabu", (err, token) => {
      res.json({ loginToken: token, wasRegisterSuccess: true });
      if (err) {
        console.log(err);
      }
    });
  } else {
    res.json({ wasRegisterSuccess: false });
  }
});

app.post("/login", async (req, res) => {
  const findedUser = await usrModel.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (findedUser) {
    jwt.sign(
      {
        email: findedUser.email,
      },
      "Jjjjjpokaoijajoaonioaajabuhauabuhabu",
      (err, token) => {
        res.json({ loginToken: token, wasLoginSucess: true });
      }
    );
  } else {
    res.json({ wasLoginSucess: false });
  }
});

app.post("/saveSearchQuery", async (req, res) => {
  const loginToken = req.header("loginToken");

  jwt.verify(
    loginToken,
    "Jjjjjpokaoijajoaonioaajabuhauabuhabu",
    async function (err, decoded) {
      const userEmail = decoded.email;

      const alreadySavedQuery = await searchModel.findOne({
        search: req.body.search,
        userEmail: userEmail,
      });

      if (!alreadySavedQuery) {
        const newSearch = new searchModel({
          search: req.body.search,
          userEmail: userEmail,
        });
        await newSearch.save();
      }
      res.json({});
    }
  );
});

app.get("/savedSearches", async (req, res) => {
  const loginToken = req.header("loginToken");

  jwt.verify(
    loginToken,
    "Jjjjjpokaoijajoaonioaajabuhauabuhabu",
    async (err, decoded) => {
      res.json(await searchModel.find({ userEmail: decoded.email }));
    }
  );
});

app.post("/deleteSearch", async (req, res) => {
  await searchModel.deleteOne({ _id: req.body.id });
  res.json({});
});

const PORT = process.env.PORT || 8080;
mongoose.connect(
  "",     // Here you must enter MongoDB URI
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
