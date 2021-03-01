const express = require('express');
const { authToken } = require("../middleware/auth")
const { ToyModel, validToy } = require("../models/toyModel")

const router = express.Router();

router.get("/", async (req, res) => {
    let minSum = (req.query.min) ? Number(req.query.min) : 0;
    let maxSum = (req.query.max) ? Number(req.query.max) : 99999;
    let qSearch = req.query.s;
    let qRegExp = new RegExp(qSearch, "i");
    let perPage = (req.query.pp) ? Number(req.query.pp) : 10;
    let page = req.query.p;
    let sortQ = (req.query.sort) ? (req.query.sort) : "_id";
    let ifReverse = (req.query.r == "y") ? -1 : 1;
    try {
        let data = await ToyModel.find({ $or: [{ name: qRegExp }, { info: qRegExp }], price: { $gte: minSum, $lte: maxSum } })
            .sort({ [sortQ]: ifReverse })
            .limit(perPage)
            .skip(page * perPage-perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});

router.get("/category/:category", async (req, res) => {
    let category = req.params.category;
    try {
        let data = await ToyModel.find({category:category})
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});

router.post("/", authToken, async (req, res) => {
    let validBody = validToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let toy = new ToyModel(req.body);
        toy.user_id = req.userData._id;
        await toy.save();
        res.status(201).json(toy);
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});

router.put("/:editID", authToken, async (req, res) => {
    let idEedit = req.params.editID;
    let validBody = validToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let itemEdit = await ToyModel.updateOne({ _id: idEedit, user_id: req.userData._id }, req.body);
        res.json(itemEdit);
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});

router.delete("/:deleteID", authToken, async (req, res) => {
    let deleteID = req.params.deleteID;
    try {
        let itemDelete = await ToyModel.deleteOne({ _id: deleteID, user_id: req.userData._id });
        res.json(itemDelete);
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});

module.exports = router;