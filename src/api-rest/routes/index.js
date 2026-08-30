// const controller = require("../controller");
const express = require('express');
const router = express.Router();
const multer = require('multer');
const multParse = multer();
const fs = require('fs');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './src/api-rest/upload');
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       new Date().toISOString().replace(/:/g, '_') + '_' + file.originalname,
//     );
//   },
// });
// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === 'image/jpeg') {
//     cb(null, true)
//   } else {
//     cb(null, false)
//   }
// }
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   // fileFilter: fileFilter
// });
// const upload = multer({dest: 'upload/'});

// const appCheckVerification = require('../../middleware/appCheckMiddleware');
// const passingGraphQLMiddleware = require('../../middleware/passingGraphQLMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const ExcelExportService = require('../../services/export/excelExportService');

// Import auth routes
const authRoutes = require('./auth');

async function handleExcelExport(req, res) {
  try {
    const source = {
      ...(req.query || {}),
      ...(req.body || {}),
    };

    const result = await new ExcelExportService({
      currentUser: req.currentUser,
      language: req.language,
    }).export({
      collection: source.collection,
      fields: source.fields,
      ids: source.ids,
    });

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );
    res.send(Buffer.from(result.buffer));
  } catch (error) {
    console.error('Unable to export excel.', error);

    const statusCode =
      error.code === 400 || error.code === 403 || error.code === 404
        ? error.code
        : 500;

    res.status(statusCode).send({
      status: false,
      result: null,
      error: { code: error.code, message: error.message },
    });
  }
}

let routes = (app) => {
  router.post('/createAppCheckToken', multParse.none(), async (req, res) => {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.ip;
      console.log('IP_ADDRESS =', ipAddress);
      
      const appId = req.body.appId;
      console.log(appId);
      // Token expires in an hour.
      // const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

      const AppCheckService = require('../../infrastructure/appCheckService');
      const appCheckToken = await AppCheckService.createAppCheckToken(appId);
      console.log(appCheckToken);

      res.send(appCheckToken);
    } catch (error) {
      console.error('Unable to create App Check token.');
      console.error(error);

      if (error.code && error.code == 404) {
        res.status(404).send({ status: false, result: null, error: { code: error.code, message: error.message } });
      } else {
        res.status(500).send({ status: false, result: null, error: { code: error.code, message: error.message } });
      }
    }
  });

  router.get('/export-excel', authMiddleware, async (req, res) => {
    await handleExcelExport(req, res);
  });

  router.post('/export-excel', authMiddleware, async (req, res) => {
    await handleExcelExport(req, res);
  });

  router.get('/exportSchema', multParse.none(), (req, res) => {
    // File content or data
    const fileContent = 'This is the content of the file.';
  
    // Generate a unique filename
    const filename = `sdlSchema_${Date.now()}.graphql`;
  
    // Create the file
    fs.writeFile(filename, fileContent, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Failed to create the file.');
      } else {
        // Send the file as a response
        res.download(filename, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Failed to download the file.');
          }
  
          // Delete the file after sending it
          fs.unlink(filename, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });
      }
    });
  });

  // router.get('/exportProductsToExcel', multParse.none(), async (req, res) => {
  //   try {
  //     const provider_name = req.query.provider_name;
  //     // ['bitaqaty', 'zain'].includes(provider_name);
      
  //     const fileName = provider_name ? `${provider_name}_products.xlsx` : 'products.xlsx';
  //     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadheetml.sheet');
  //     res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

      
  //     const ProductRepository = require('../../database/repositories/productRepository');
  //     const workbook = await new ProductRepository().exportToExcel(provider_name);

  //     const buffer = await workbook.xlsx.writeBuffer(res);
  //     res.send(buffer);
  //     // await workbook.xlsx.write(res);
  //     // res.end();
  //   } catch (error) {
  //     if (error.code && error.code == 404) {
  //       res.status(404).send({ status: false, result: null, error: { code: error.code, message: error.message } });
  //     } else {
  //       res.status(500).send({ status: false, result: null, error: { code: error.code, message: error.message } });
  //     }
  //   }
  // });

  // Add auth routes
  app.use('/auth', authRoutes);

  app.use(router);
};

module.exports = routes;