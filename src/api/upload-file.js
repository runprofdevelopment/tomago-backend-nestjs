const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
// const multParse = multer();

// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const app = express();

// Set storage engine
const storage = (type) => {
  const memoryStorage = multer.memoryStorage();
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src/api/uploads');
    },
    filename: function (req, file, cb) {
      cb(
        null,
        new Date().valueOf() + '_' + file.originalname,
      );
      // cb(null, new Date().toISOString().replace(/:/g, '_') + '_' + file.originalname);
      // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });

  switch (type) {
    case 'memory':
      return memoryStorage;
    case 'disk':
      return diskStorage;
    default:
      return diskStorage;
  }
};

const fileFilter = (req, file, cb) => {
  checkFileType(file, cb);
  // if (file.mimetype === 'image/jpeg') { // reject a file
  //   cb(null, true)
  // } else {
  //   cb(null, false)
  // }
};

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|svg/;
  // Check ext
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }

  // if (file.mimetype === 'image/jpeg') { // reject a file
  //   cb(null, true)
  // } else {
  //   cb(null, false)
  // }
}

// Initialize upload
const upload = multer({
  storage: storage('memory'),
  limits: {
    fileSize: 1024 * 1024 * 50, // Limit file size to 50MB
  },
  startProcessing(req, busboy) {
    req.rawBody
      ? busboy.end(req.rawBody)
      : req.pipe(busboy);
  },
  // fileFilter: fileFilter
});
// .array('images', 10); // 'images' is the field name, 10 is the max count
// .array('images');

router.post(
  '/',
  upload.array('files', 30),
  async (req, res) => {
    const URLS = [];

    try {
      const FILES = req.files;
      const destination = req.body.destination;

      if (!FILES.length) {
        return res.status(400).send('No file uploaded.');
      }

      // Ensure Firebase is initialized before using storage
      require('../infrastructure/firebaseInit');
      const FirebaseStorageRepository = require('../database/repositories/firebaseStorageRepository');

      let index = 0;
      for (const FILE of FILES) {
        let processedImageBuffer;
        let fileExtension;
        let fileType;

        if (FILE.mimetype === 'image/gif') {
          // Preserve GIFs in original format
          processedImageBuffer = FILE.buffer;
          fileExtension = 'gif';
          fileType = 'image/gif';
        } else {
          // Process other image types and convert to WebP
          const metadata = await sharp(
            FILE.buffer,
          ).metadata();
          const newWidth = Math.round(metadata.width * 0.3);
          const newHeight = Math.round(
            metadata.height * 0.3,
          );

          processedImageBuffer = await sharp(FILE.buffer)
            .resize(newWidth, newHeight, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .webp({
              quality: 80,
              lossless: true,
              alphaQuality: 80,
              effort: 6,
            })
            .toBuffer();
          fileExtension = 'webp';
          fileType = 'image/webp';
        }

        // Generate a file name with appropriate extension
        const fileName = `${new Date().valueOf()}-${
          FILE.originalname.split('.')[0]
        }.${fileExtension}`;

        // Upload the processed image to Firebase Storage
        const url =
          await FirebaseStorageRepository.uploadBufferFile({
            buffer: processedImageBuffer,
            destination: `${destination}/${fileName}`,
            fileType: fileType,
          });

        index++;
        console.log(`[${index}] URL =`, url);
        URLS.push(url);
      }

      console.log('Files uploaded successfully');
      res.status(200).send({ publicUrls: URLS });
    } catch (error) {
      console.error({ ...error });
      res.status(500).send({ error: error.message });
    }
  },
);

// router.post('/', upload.single('file'), async (req, res) => {
//   try {
//     const FILE = req.file;
//     const destination = req.body.destination;

//     if (!FILE) {
//       return res.status(400).send('No file uploaded.');
//     }

//     const FirebaseStorageRepository = require('../database/repositories/firebaseStorageRepository');
//     const url = await FirebaseStorageRepository.uploadBufferFile({
//       buffer: FILE.buffer,
//       destination: `${destination}/${FILE.originalname}`,
//       fileType: FILE.mimetype,
//     });

//     console.log('URL =', url);
//     console.log('Uploaded file successfully');
//     res.status(200).send({ publicUrl: url });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// })

// Route to handle file upload
// app.post('/upload', (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       res.status(400).send({ message: err });
//     } else {
//       if (req.files.length === 0) {
//         res.status(400).send({ message: 'No files uploaded' });
//       } else {
//         res.send({ message: 'Files uploaded successfully', files: req.files });
//       }
//     }
//   });
// });

module.exports = router;
