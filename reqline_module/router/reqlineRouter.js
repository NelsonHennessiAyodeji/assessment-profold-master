const express = require('express');

const router = express.Router();
const parseRequest = require('../controller/reqlineController');

// Let this display something
router.get('/', (req, res) => {
  res.send('Hello');
});
router.post('/', parseRequest);

module.exports = router;
