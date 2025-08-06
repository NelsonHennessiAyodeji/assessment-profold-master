const express = require('express');

const router = express.Router();
const parseRequest = require('../controller/reqlineController');

// Let them do thesame thing
router.get('/', parseRequest);
router.post('/', parseRequest);

module.exports = router;
