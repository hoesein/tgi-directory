const Listing = require('../models/Listing');

exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate('category').populate('user', 'name email');
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('category')
      .populate('user', 'name email');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const listing = await Listing.create(req.body);
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await listing.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
