const express = require('express');
const router = express.Router();
const {
  upload,
  uploadFile,
  getFiles,
  getFile,
  deleteFile,
  renderHome
} = require('../controllers/file.controller');

router.get('/', renderHome);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/files', getFiles);
router.get('/files/:id', getFile);
router.get('/files/:id/delete', deleteFile);
router.delete('/files/:id', deleteFile);

module.exports = router; 