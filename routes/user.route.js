const express = require("express");
const indexpage = require("../controllers/user.controller");
const router = express.Router();

router.get("/", indexpage);

module.exports = router;