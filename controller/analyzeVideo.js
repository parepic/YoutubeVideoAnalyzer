
const ytdl = require('ytdl-core');
const fluentffmpeg = require("fluent-ffmpeg");
const fs = require('fs');
const { spawn } = require("child_process");
const lemmatizer = require('node-lemmatizer');
const stopWords = require("../data/stopwords.js");
const utils = require("../util/utils");
const smallRecognizer = require("../speechToText/smallRecognizer");
const largeRecognizer = require("../speechToText/largeRecognizer");


const yt_id = process.argv[2];
const demo = process.argv[3];
const phrase = process.argv[4];


SAMPLE_RATE = 16000; 
BUFFER_SIZE = 4000;
FILE_PATH = "data/audio.wav"
CONTRACTIONS_PATH = "data/contractions.json"
PROFANITYWORDS_PATH = "data/swear_words.json"

analyzeAudio();

async function analyzeAudio() {
    try {
        const uri = "https://www.youtube.com/watch?v=" + yt_id;
        await videoToAudioFile(uri);
        var startTime = performance.now();
        const results = await audioFileToWordList();
        var endTime = performance.now()
        console.log("audio file to text conversion took: ", (endTime-startTime)/60000.0, " minutes");
        const voiceRecognitionResults = results[0];
        var wordList = results[1];
        const wordListNotmalized = removeContractions(wordList);
        const inputWords = phrase.split(" ");
        const timeStamps = countWords(inputWords, wordList);
        const stats = generateStat(wordListNotmalized);
        fs.writeFileSync("output/words.json", JSON.stringify(voiceRecognitionResults));
        fs.writeFileSync("output/wordStat.json", JSON.stringify(stats));
        const detectedProfanities = detectProfanity(wordListNotmalized);
        const jsonResult = {
            "wordList": wordList,
            "phraseSearch": {
                "phrase": phrase,
                "times": timeStamps
            },
            "stat": stats,
            "profanities": detectedProfanities
        };
        fs.writeFileSync("output/profanities.json", JSON.stringify(detectedProfanities));
        fs.writeFileSync('output/words.json', JSON.stringify(wordListNotmalized));
        console.log("Finishing child process")
        process.send({results: jsonResult});
    }
    catch(err) {
        if(!err.statusCode) { 
            err.statusCode = 500;
        }
        process.send({error: err});
    }

    //   res.json(
    //     {"phraseSearch":{"phrase":"like","times":[8.511062,9.206287,20.58,24.609624,37.538374,38.368187,53.53675,60.935938,63.655751]},"dbSearch":{"https://www.youtube.com/watch?v=p4QmQqSf1l8&t=87s":[8.439875,15.029063,32.137438],"https://www.youtube.com/watch?v=9QPQ6DETVHA":[67.887563,86.035684,134.186032,140.391634],"https://www.youtube.com/watch?v=ThO5iqzv_XM":[20.427125,33.795749,111.358186,123.566936,168.112693,306.039192,318.277949,322.437762,331.326737,357.246317,359.808857,365.153505,396.050428,443.095736,510.77918,512.358993,517.56913,520.628215,522.008215,522.477937,523.597145,524.68585,527.587563,529.174499,560.874331,561.264331,611.50936],"https://www.youtube.com/watch?v=60RFIF9y8fY":[20.727125,25.106563,140.04532,237.165935,259.403698,433.096761,509.049366,566.363679,628.377744],"https://www.youtube.com/watch?v=2sjJTJdjBGw":[32.49089,34.395749,35.145749,43.594762,55.505145,63.692604,93.839997,116.587752,144.614931,149.034496,183.311249,190.440546,206.951726,207.668809,209.014477,210.928612,216.23794,219.607567,220.507567,221.824522,226.80693,241.843811,251.644506,301.769626,311.738571,315.676054,316.998197,330.019874,335.056384,341.917641,349.624934,351.31866,355.0045,355.564281,359.537057,365.003505,367.00342,371.362883,383.15161,389.270989,391.660802,400.230302,401.539543,410.438999,412.078812,416.888378,418.707588,440.483946,446.715488,448.655302,470.833064,481.612147,488.485049,492.331017,493.058491,494.420826,499.85009,500.180175,516.862771,517.948724,520.218372,529.797346,537.140388,565.833896],"https://www.youtube.com/watch?v=bqt7qh5oq38":[6.868375,7.738619,45.354689,67.264095,95.44981,187.01261,187.640509,197.369819,216.71794],"https://www.youtube.com/watch?v=eAD31MVUQQE":[8.074125,36.34125,45.360438,46.254646,76.977374,112.773939,114.323752,117.449001,139.161252,162.05906,166.748625,173.847817,174.784884,183.736994,191.646186,221.173312,232.30213,270.878433,293.566444,312.314301,355.07026,373.698427,374.469922,378.526919,409.284946,428.153113,432.092678,436.302305,444.061497,469.979072,478.128173,494.40383,495.82637,511.23494,525.503511,539.460044,553.180783,556.310435,566.695532,569.539253,593.487058,609.785369,629.453318]},"stat":{"like":9,"love":6,"porn":4,"know":4,"architecture":4,"yeah":3,"actually":2,"really":2,"torture":2,"people":2,"food":2,"beautiful":2,"hi":1,"sexual":1,"term":1,"give":1,"watch":1,"beat":1,"world":1,"star":1,"sake":1,"call":1,"also":1,"explain":1,"foodborne":1,"look":1,"delicious":1,"cake":1,"cook":1,"steak":1,"holy":1,"shit":1,"likely":1,"see":1,"sega":1,"dopey":1,"mean":1,"nothing":1,"need":1,"ha":1,"think":1,"nobody":1,"get":1,"hurt":1,"intact":1,"tax":1,"occasion":1,"bad":1,"part":1,"one":1,"person":1,"prize":1,"life":1,"right":1,"say":1,"bill":1,"maher":1,"nan":1,"use":1,"allow":1},"profanities":{"porn":[2.991688,15.470437,20.19,32.068812],"shit":[25.199437]}}  
    //   );
}


function removeContractions(wordList) {
    var wordListNoContractions = [];
    var contractionAndConversions = JSON.parse(fs.readFileSync(CONTRACTIONS_PATH));
    var contractions = Object.keys(contractionAndConversions);4
    for(let i = 0; i < wordList.length; i++) {
        var oldWord = wordList[i];
        var index = utils.binarySearch(contractions, wordList[i].word);
        if(index !== -1) {
            var words = contractionAndConversions[contractions[index]].split(" ");
            words.forEach(word => {
                wordListNoContractions.push(
                    {
                        start: oldWord.start,
                        end: oldWord.end,
                        word: word
                    }
                )
            })
        }
        else {
            wordListNoContractions.push(oldWord);
        }
    }
    return wordListNoContractions;
}

function countWords(inputWords, wordList) {
    let timeStamps = [];
    for (let i = 0; i < (wordList.length - inputWords.length + 1); i ++) {
        let match = true;
        let j = i;
        for(let inputWord of inputWords) {
            if(inputWord.trim().toLowerCase() !== wordList[j].word) {
                match = false;
                break;
            }
            j = j + 1;
        }
        if(match) {
            timeStamps.push(wordList[i].start);
        }
    }
    return timeStamps;
}

function findShortestWord(words) { 
    var smallestSize = 99999999;
    var smallestWord = "";
    words.forEach(word => {
        if(word.length <= smallestSize) {
            smallestSize = word.length;
            smallestWord = word;
        }
    })
    return smallestWord;
}  

function generateStat(wordList) {
    var stat = {};
    wordList.forEach(wordObj => {
        const word = findShortestWord(lemmatizer.only_lemmas(wordObj.word.split("'")[0]));
        if(word != "" && !stopWords.includes(word)) {
            if(word in stat) {
                stat[word] += 1;
            }
            else {
                stat[word] = 1;
            }
        }
    })
    const sortable = Object.entries(stat)
        .sort(([,a],[,b]) => b-a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    return sortable;
}

function detectProfanity(wordList) {
    detectedProfanities = {};
    const swear_words = Object.keys(JSON.parse(fs.readFileSync(PROFANITYWORDS_PATH)));
    wordList.forEach((wordObj) => {
        const word = findShortestWord(lemmatizer.only_lemmas(wordObj.word.split("'")[0]));
        if(word) {
            const wordIndex = utils.binarySearch(swear_words, word);
            if(wordIndex !== -1) { 
                if(wordObj.word in detectedProfanities) {
                    detectedProfanities[wordObj.word].push(wordObj.start);
                }
                else {
                    detectedProfanities[wordObj.word] = [wordObj.start];
                }
            }
        }   
    })
    return detectedProfanities;
}


function videoToAudioFile(uri) {
    return new Promise((resolve, reject) => {
    var startTime = performance.now()
    const videoStream = ytdl(uri, {quality: 'highestaudio'}).on('error', (err) => {
        const error = utils.createError("Could not fetch video data based on the provided URL. Make sure the entered URL is valid.", 400);
        reject(error);
    });
        new fluentffmpeg({source: videoStream}).format("wav").audioChannels(1).save(FILE_PATH).on("end", () => {
            var endTime = performance.now()
            console.log("Url to Wav conversion took ", endTime - startTime, " milliseconds.");
            resolve("video to audio conversion done")}).on('error', (error) => reject(error));
    });
}


function audioFileToWordList() {
    return new Promise((resolve) => {
        var rec = (demo === "on") ? smallRecognizer.initiateRec() : largeRecognizer.initiateRec();
        rec.setWords(true);
        const results = [];
        const ffmpeg_run = spawn('ffmpeg', ['-loglevel', 'quiet', '-i', FILE_PATH,
                                '-ar', String(SAMPLE_RATE) , '-ac', '1',
                                '-f', 's16le', '-bufsize', String(BUFFER_SIZE), '-']);
        ffmpeg_run.stdout.on('data', (stdout) => {
            if (rec.acceptWaveform(stdout))
                results.push(rec.result());
            results.push(rec.finalResult());
        }).on('error', err => reject(err));
        
        ffmpeg_run.on('exit', async code => {
            const wordList = [];
            results.forEach(element =>{
                if (!element.hasOwnProperty('result'))
                    return;
                const words = element.result;
                for (let i = 0; i < words.length; i++) {
                        wordList.push(words[i]);
                    }
        });
        resolve([results, wordList]);
    }).on('error', err => reject(err))
    });
}