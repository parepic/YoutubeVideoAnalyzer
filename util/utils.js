const vosk = require("vosk");
SAMPLE_RATE = 16000; 
const smallModel = new vosk.Model("speechToText/src/vosk-model-small-en-us-0.15");
const largeModel = new vosk.Model("speechToText/src/vosk-model-en-us-0.22-lgraph");

exports.binarySearch = (arr, val) => {
    let start = 0;
    let end = arr.length - 1;
    while (start <= end) {
      let mid = Math.floor((start + end) / 2);
      if (arr[mid] === val) {
        return mid;
      }
      if (val < arr[mid]) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }
    return -1;
  }

exports.createError = (message, statusCode) => { 
  const error = new Error();
  error.message = message;
  error.statusCode = statusCode;
  return error;
}


exports.initiateRecognizer = (demo) => {
  if(demo === "on") { 
    console.log("choosing small model" + demo);
    return new vosk.Recognizer({model: smallModel, sampleRate: SAMPLE_RATE});
  }
  console.log("choosing large model" + demo);
  return new vosk.Recognizer({model: largeModel, sampleRate: SAMPLE_RATE});
}