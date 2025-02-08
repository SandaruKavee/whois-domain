const express = require("express");
const router = express.Router();
const whoisController = require("../controllers/whoisController");

// Route to the controller
router.get("/all", whoisController.getAll);   //http://localhost:3000/domains/all
router.get("/domain-info", whoisController.getDomainInfo); //http://localhost:3000/domains/domain-info?domain_name=009dutch.nl

module.exports = router;
