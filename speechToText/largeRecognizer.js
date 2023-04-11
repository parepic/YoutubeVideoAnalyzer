const vosk = require("vosk");
SAMPLE_RATE = 16000; 
const model = new vosk.Model("speechToText/src/vosk-model-en-us-0.22-lgraph");

function initiateRec() {
    return new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE});
}

module.exports = {
    "model": model,
    "initiateRec": initiateRec,
};

