const express = require('express');
const app = express();
const route = require("./route/route");
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const sessions = require('express-session');
var sessionToProcess = require("./data/sessionToProcessMap");
var dotenv = require('dotenv');

dotenv.config();
app.use(express.static('views'));
app.use(sessions({
  secret: 'secretsecretsecretsecretsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


app.use('/', route);


app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  if(status === 500) {
    if(sessionToProcess[req.session.id]){
      delete sessionToProcess[req.session.id];
    }
  }
  // req.session.busy = false;
  // req.session.save();
  res.status(status).send(message);
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODBPASSWORD}:${process.env.MONGODBUSERNAME}@atlascluster.76hyhm9.mongodb.net/YtVidAnalyzer?retryWrites=true&w=majority`
  ).then(app.listen(4000));