var express = require('express');
var router = express.Router();

router.use('/', (req, res, next) => {
  if (!req.query.userId) {
    console.log("user id missing");
    res.status(404).send("user id is neccessary");
  } else {
    next();
  }
})

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query.userId);
  res.json({msg: "Welcome!"});
});

module.exports = router;
