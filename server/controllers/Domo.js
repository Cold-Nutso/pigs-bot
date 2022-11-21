const mongoose = require('mongoose');

// Create a model just to delete domos
mongoose.model('Deletor', new mongoose.Schema({}), 'domos');
const deletor = mongoose.model('Deletor');

const models = require('../models');

const { Domo } = models;

const makerPage = (req, res) => res.render('app');

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.food) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    food: req.body.food,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age, food: newDomo.food });
  } catch (err) {
    // console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const deleteDomo = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Missing domo id.' });
  }

  try {
    await deletor.deleteOne({ _id: mongoose.Types.ObjectId(req.body._id) });

    return res.status(200).json({ message: 'Domo successfully deleted.' });
  } catch (err) {
    // console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const getDomos = (req, res) => {
  Domo.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      // console.log(err);
      return res.status(400).json({ error: 'An error has occurred!' });
    }

    return res.json({ domos: docs });
  });
};

module.exports = {
  makerPage,
  makeDomo,
  deleteDomo,
  getDomos,
};
