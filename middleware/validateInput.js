const utils = require("../util/utils");
var sessionToProcess = require("../data/sessionToProcessMap");

module.exports = (req, res, next) => {
  console.log("Nr of sessions: ",Object.keys(sessionToProcess).length);
  if(sessionToProcess[req.session.id]) {
      throw utils.createError("Only one request at a time is allowed", 429);
  }
    const url = req.query.url;
    const phrase = req.query.phrase;
    if(!url || !phrase || !url.trim() || !phrase.trim()) {
        throw utils.createError('At least one of the required fields are empty', 400);
    }
    if(!/^[a-zA-Z ]+$/.test(phrase)) {
      throw utils.createError('Invalid input phrase. Only alphabetic characters are allowed', 400);
    }
    if(url.split("v=").length !== 2 ){
      throw utils.createError('Could not fetch video data based on the provided URL. Make sure the entered URL is valid.', 400);
    }
    next();
}


function verifyInputPhrase(phrase) {
    if(!/^[a-zA-Z ]+$/.test(phrase)){
      return false;
    }
    const inputWords = phrase.split(" ");
    for (let i = 0; i < inputWords.length; i++) {
      if(inputWords[i].length === 0) {
        return false;
      }
    }
    return true;
  }