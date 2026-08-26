const controller = require("../controller");
const express = require('express');
const router = express.Router();
const multer = require('multer');
const multParse = multer();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/api-rest/upload');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '_') + '_' + file.originalname,
    );
  },
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  // fileFilter: fileFilter
});
// const upload = multer({dest: 'upload/'});

// const appCheckVerification = require('../../middleware/appCheckMiddleware');
const passingGraphQLMiddleware = require('../../middleware/passingGraphQLMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');

let routes = (app) => {
  // router.post('/graphql/convert-sdl-to-json-schema', upload.single('sdlSchema'), authMiddleware, controller.convertSdlToJsonSchema);
  router.get('/files/:name', controller.download);
  router.post('/send-email', multParse.none(), controller.sendEmail);
  router.post('/send-notification', multParse.none(), controller.sendNotification);
  // router.post('/test-batch', multParse.none(), controller.testBatch);
  // router.post('/test-promise', multParse.none(), controller.testPromise);
  // router.post('/create-index', multParse.none(), async function(req, res) {
  //   const FirebaseRepository = require('../../../src/database/utils/firebaseRepository')
  //   const response = await FirebaseRepository.newIndex()
  //   console.log(response);
  //   res.status(200).send({response})
  // });
  // router.post('/round-number', multParse.none(), function(req, res) {
  //   try {
  //     const HelperClass = require('../../../src/database/utils/helperClass')
  //     const number = parseFloat(req.body.number)
  //     const scale = parseInt(req.body.scale)
  //     const roundNum = HelperClass.roundNumber(number, scale)
  //     res.status(200).send({roundNum})
  //   } catch (error) {
  //     res.status(500).send(error)      
  //   }
  // });

  router.get('/exportProductsToExcel', multParse.none(), async (req, res) => {
    try {
      const fileName = 'Products.xlsx';
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

      const ProductRepository = require('../../database/repositories/productRepository');
      const workbook = await new ProductRepository().exportToExcel()

      await workbook.xlsx.write(res);
      res.end()
    } catch (error) {
      if (error.code && error.code == 404) {
        res.status(404).send({ status: false, result: null, error: { code: error.code, message: error.message } });
      } else {
        res.status(500).send({ status: false, result: null, error: { code: error.code, message: error.message } });
      }
    }
  });


  app.use(router);
};

module.exports = routes;