const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { mongoURI } = require('../config/database');
const moment = require('moment');

let bucket;
mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

// Configuración del storage para GridFS
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'uploads'
    };
  }
});

const upload = multer({ storage });

const renderHome = async (req, res) => {
  try {
    const files = await bucket.find().toArray();
    res.render('index', { 
      files,
      moment,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Error in renderHome:', error);
    res.render('index', { 
      files: [],
      moment,
      error: 'Error loading files'
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/?error=No file selected');
    }
    res.redirect('/?success=File uploaded successfully');
  } catch (error) {
    console.error('Error in uploadFile:', error);
    res.redirect('/?error=' + error.message);
  }
};

const getFiles = async (req, res) => {
  try {
    const files = await bucket.find().toArray();
    res.json(files);
  } catch (error) {
    console.error('Error in getFiles:', error);
    res.status(500).json({ message: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set('Content-Type', files[0].contentType);
    res.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error in getFile:', error);
    res.status(404).json({ message: 'File not found' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    await bucket.delete(fileId);
    res.redirect('/?success=File deleted successfully');
  } catch (error) {
    console.error('Error in deleteFile:', error);
    res.redirect('/?error=' + error.message);
  }
};

module.exports = {
  upload,
  uploadFile,
  getFiles,
  getFile,
  deleteFile,
  renderHome
}; 