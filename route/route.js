const express = require('express');
const router = express.Router();
const validateInput = require("../middleware/validateInput");
const mainController = require("../controller/controller");

router.get("/", mainController.homePage);
router.get("/analyze", validateInput, mainController.analyzeAudio);
router.post("/feedback", mainController.saveFeedback);
router.post("/haltProcesses", mainController.haltProcesses);



module.exports = router;

