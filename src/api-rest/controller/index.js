
const config = require('../../../config')();
const functions = require('firebase-functions');
const HelperClass = require('../../database/utils/helperClass')

const data = {
  logo: 'https://firebasestorage.googleapis.com/v0/b/saryah-31e36.appspot.com/o/offer%2F5jHG23MCJIemCs1vEtLPXjwmUIB3%2F5jHG23MCJIemCs1vEtLPXjwmUIB31621950441272%2F1621950441300?alt=media&token=34c2a868-d966-4218-8f7e-9ab967ec4e57',
  name: 'Star Bucks',
};

const sendEmail = async (req, res) => {
  try {
    console.log('------------------- Entered -------------------');

    // const email = {
    //   to: {
    //     name: 'Mohamed Ali',
    //     address: 'eng.mohamedali99@gmail.com',
    //   },
    //   cc: {
    //     name: 'Mohamed Ali',
    //     address: 'mohamedali.runprof@gmail.com',
    //   },
    //   // to: 'eng.mohamedali99@gmail.com',
    //   // cc: 'mohamedali.runprof@gmail.com',
    //   // bcc: 'mohamedali.runprof@gmail.com',
    //   subject: 'Hello ✔',
    //   // text: 'Plaintext version of the message',
    //   html: '<b>Hello world?</b>',
    // }
    // const EmailSender = require('../../services/shared/email/emailSender')
    // const sender = new EmailSender(email)
    // await sender.send()

    // Girgis Nabil <girgis.n.lotfi@gmail.com>
    // 'muhammed.farag@shamystores.com'
    const client = { email: 'mohamedali.runprof@gmail.com' }
    const serials = [
      {
        "name": "PlayStation 10$ USA",
        "sku": "PlayStation 10$ USA",
        "id": "1229",
        "price": "9.3000",
        "count": 3,
        "serials": [
          {
            "PIN_VALUE": "SL4L-DMNN-8KL8",
            "SN_VALUE": "PSN10$20221228-1261"
          },
          {
            "PIN_VALUE": "GD8K-DMNN-8KL8",
            "SN_VALUE": "PSN10$20221228-1261"
          },
          {
            "PIN_VALUE": "GD8M-DOPN-0DL8",
            "SN_VALUE": "PSN10$20221228-1261"
          }
        ]
      },
      {
        "name": "PlayStation 50$ USA",
        "sku": "PlayStation 50$ USA",
        "id": "1205",
        "price": "302.59",
        "count": 1,
        "serials": [
          {
            "PIN_VALUE": "GD8K-DMNN-2MB2",
            "SN_VALUE": "PSN10$20221228-1265"
          }
        ]
      }
    ]
    
    const OrderRepository = new (require('../../../src/database/repositories/orderRepository'))
    await OrderRepository.sendEmailToClientWithSerials(client, serials)

    // const Orders = await OrderRepository.list({ filter: { buyerEmails: ['gsg26g@gmail.com', 'wyg16g@gmail.com'] } })
    // Orders.rows.forEach(async (order) => {
    //   const DETAILS = { orderName: order.shopify_order_name }
    //   await OrderRepository.sendEmailToClientWithSerials(client, order.provider_products_serials, DETAILS)
    // });

    res.status(200).send({
      success: true,
      message: 'Email Send Successfully',
      data: 'email',
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Email Not Send',
      data: error,
    });
  }
}

const sendNotification = async (req, res) => {
  try {
    console.log('------------------- Entered -------------------');
    const PushNotificationSender = require('../../services/shared/fcm/pushNotificationSender');


    // Define the devices to send the message to
    const registrationTokens = [
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU0NWUyNDZjNTEwNmExMGQ2MzFiMTA0M2E3MWJiNTllNWJhMGM5NGQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoibm91ciIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ob21lLWZvb2QtcGx1cyIsImF1ZCI6ImhvbWUtZm9vZC1wbHVzIiwiYXV0aF90aW1lIjoxNjg1Nzg5OTM1LCJ1c2VyX2lkIjoiUThsQWt5a2xueVpUY1A4WjN5MmViNkpnMU1zMSIsInN1YiI6IlE4bEFreWtsbnlaVGNQOFozeTJlYjZKZzFNczEiLCJpYXQiOjE2ODU3ODk5MzUsImV4cCI6MTY4NTc5MzUzNSwicGhvbmVfbnVtYmVyIjoiKzIwMTI4OTE0NzAwMSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzIwMTI4OTE0NzAwMSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.K3qUXiXrgFcdVP5LAwDYk0KocZ1oPEeCVpRKLWOlA_ytWCGKq9kOnwuT25WOqnwOEZyDT8WgT4I3CcFSZcspswa2xO2JxmCsRUhh4JXyAfxsAMmF7if8uOQjo5xI_9YNi6oiYUaGO7vHeX3RZegXIiAiFBJCwBEozen2igBZVoKrS8jpOCVY5LSHoZ48Bb0YN01pTlJ_fuwDGPtvZiVHpLx0Rhmskr4syQT1C7aZgKcDBA1SSvB_m9im_ub5BfP1DRuukxae5B9GL4ZK4gtpXWbmBcj2sj5xmkG0uV3XgBKc1WgzYcEJaLYuYIHROQCn9njEWLCGYMGBaGn13Qae6g",
      "d8QzowURakpPqyawQ1RXJ0:APA91bHOvf1J28T0WMh37zV1RaGwJf7fw-AmhOZ2Bth4lyDtFhkLgsdso9i3falh2qbogf-b_VlLXULiV3NZuysCrJYbQ7W0aBqHFcoJ8mh1zygkqJf6QIcfapS_qrMXcEA0eyV3_mvL",
      "e69FReQHHkDPoRb8DG9AHA:APA91bG0ugOFo2LT3x1w0HyAYVkbuwqcg64Gr7lUocyyGe7cvXW7c8REtSu4cjoIXuQ4iQPJyzFvmk-gSx8cl-OWNbKr5JlbD8-hqKfUKabFUw7rt8IAxN29BoKdeh5X6VuFS2ooKRL0",
      "fWDYMNZdO0qBoeNg38px-g:APA91bHePBLRH0HDn_eYZb2QUtLrkhreGK0XlGRLPKSEbrj9V27U72IpxUYQooY8PW5OE-5kQFL1Mlx-Mwt0dxBsig7oyDHJ6DEBJh4VwGEpBQiFloOrW0OCUqc-gD8yY6pe25Q0uy50",
      "f7e4w8qI3kCugx18C68ktX:APA91bE7E3w12QQse4wq1XNvdnLsSC7lu3F0x1iLeVteSWEdvPCY3Ung-DU8lwzagWAAj4ypC2GYI4-LXbmnwLJdyo3CvQ2OOdXnRdykk9EMn85i-QDKtUNgIwS4yWLjQma_DnKpK1XU"
    ]


    // Define the message payload
    const message = {
      notification: {
        title: 'New message',
        body: 'You have a new message from John',
      },
      data: {
        score: '850',
        // time: '2:45',
        senderId: '123',
        senderName: 'John',
        message: 'Hi there!',
      },
      // webpush: {
      //   fcmOptions: {
      //     link: 'https://example.com',
      //   },
      // },
      android: {
        notification: {
          title: 'New message',
          body: 'You have a new message from John',
        },
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            // sound: 'notification.mp3',
          },
        },
      },
      
      // Pass an array of registration tokens here
      // tokens: registrationTokens
    };

    const messages = []
    registrationTokens.forEach(token => {
      messages.push({
        ...message,
        token,
      })
    })

    // await PushNotificationSender.sendAll(messages)
    await PushNotificationSender.send({
      ...message,
      token: registrationTokens[4]
    })

    // Send the message to the devices
    // const admin = require('firebase-admin');
    // admin.messaging().sendEach(messages)
    // .then((response) => {
    //   console.log(`Successfully sent message to ${response.successCount} devices`);
    // })
    // .catch((error) => {
    //   console.error(`Error sending message: ${error}`);
    //   throw `Error sending message: ${error}`
    // });

    res.status(200).send({
      success: true,
      message: 'Notification Send Successfully',
      data: message,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Notification Not Send',
      data: error,
    });
  }
}

const convertSdlToJsonSchema = (req, res) => {
  const fs = require('fs');
  const { buildSchema, graphqlSync, introspectionQuery } = require('graphql');
  try {
    const sdlString = fs.readFileSync(req.file.path, 'utf8');
    const graphqlSchemaObj = buildSchema(sdlString);
    const result = graphqlSync(graphqlSchemaObj, introspectionQuery).data;
    const data = JSON.stringify(result);
    // fs.writeFileSync(`/Users/app/Desktop/Introspection_Schema.json`, data);

    const baseUrl = config.env == 'production' 
      ? 'https://${REGION}-saryah-31e36.cloudfunctions.net/restApis/files/' 
      : 'http://localhost:3000/files/'

    const fileName = 'introspection_schema.json';
    if (config.env !== 'production') fs.writeFileSync(`./src/api-rest/upload/${fileName}`, data);
    res.status(200).json({ success: true, message: 'Successfully', data: config.env == 'production' ? data : { name: fileName, url: baseUrl + fileName }});
  } catch (error) {
    res.status(500).send({ success: false, message: '', data: error });
  }
}

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + '/upload/';

  console.log('directoryPath =', directoryPath);
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({ message: 'Could not download the file. ' + err });
    }
  });
};

const testBatch = async (req, res) => {
  try {
    const admin = require('firebase-admin');
    const AbstractRepository = require('../../database/repositories/abstractRepository');

    console.log('E N T E R');
    const batch = await AbstractRepository.createBatch();
    console.log('Create Batch');

    var nycRef = admin.firestore().collection('TestBatch').doc('NYC');
    var sfRef = admin.firestore().collection('TestBatch').doc('SF');
    var laRef = admin.firestore().collection('TestBatch').doc('LA');

    // batch.set(nycRef, { name: "New York City" });
    // batch.set(sfRef, { population: 1000000 });
    // batch.set(laRef, { name: "New Document" });
    batch.delete(laRef);
    batch.update(sfRef, {
      population: 5000,
    });

    throw 'Batch failure';

    const response = await AbstractRepository.commitBatch(
      batch,
    );

    res.status(200).send({
      success: true,
      message: 'Languages Created Successfully',
      data: response,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Languages Not Created',
      data: error,
    });
  }
}

const testPromise = async (req, res) => {
  try {
    const response = await Promise.allSettled([
      new Promise(print(resolve, reject, 'Message-1', 200)),
      new Promise(print(resolve, reject, 'Message-2', 300)),
      new Promise(print(resolve, reject, 'Message-3', 100)),
      // print('Message-2', 300),
      // print('Message-3', 100),
    ])
    
    res.status(200).send({
      success: true,
      message: 'Run Test Promise',
      response: response
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error,
    });
  }
  // return console.log('Run Test Promise');
}

async function print(resolve, reject, msg, ms) {
  // if (ms == 200) throw 'Error in time 200 ms'
  try {
    // if (ms == 200) throw 'Error in time 200 ms'
    setTimeout(() => {
      console.log(msg);
      resolve(msg)
      // return msg
    }, ms);
  } catch (error) {
    reject(error)
  }
}

module.exports = {
  sendEmail,
  sendNotification,
  testBatch,
  convertSdlToJsonSchema,
  download,
  testPromise,
};