const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Ciao, mondo! Questo è il mio server Express.');
});

module.exports = router;