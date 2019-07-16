const express = require("express");
const { Region, Weather, Airpollution } = require("../infra/mysql");

const router = express.Router();

router.get("/", (req, res) => {
  Region.findAll({ include: [Weather, Airpollution], where: { city: "서울" } })
    .then(result => {
      res.json(result);
    })
    .catch(console.warn);
});

module.exports = router;
