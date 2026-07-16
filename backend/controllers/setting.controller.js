const { Setting } = require('../models/setting.model.js');

const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ key });
    if (!setting) {
      return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find({});
    const formatted = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSetting, updateSetting, getAllSettings };
