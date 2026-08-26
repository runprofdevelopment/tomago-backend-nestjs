const functions = require('firebase-functions/v1');
const fs = require('fs');

const REGION = 'europe-west1';
const runtimeOpts = {
  timeoutSeconds: 60,
  memory: '4GB',
};

exports.landingPage = functions.region(REGION).runWith(runtimeOpts).https.onRequest(async(request, response) => {
  console.log('$~ PRERENDER ENTERED ~$')

  // Error 404 is false by default
  let error404 = false;

  // Getting the path
  const path = request.path ? request.path.split('/') : request.path;
  console.log('path = ',path)
  console.log('request.path = ', request.path)

  // Getting index.html text
  let index = fs.readFileSync('./web/index.html').toString();

  // Changing metas function
  // const setMetas = (title, twitter_image, og_image, description) => {
  //   title = title.replace(/\s/g, '_')
  //   description = description.replace(/\s/g, '_')
  //   console.log('title', title)
  //   console.log('desc', description)
  //   console.log('twitter img', twitter_image)
  //   console.log('og image', og_image)
  //   index = index.replace('TWITTER_DYNAMIC_TITLE', title);
  //   index = index.replace('TWITTER_DYNAMIC_IMAGE', twitter_image);
  //   index = index.replace('OG_DYNAMIC_TITLE', title);
  //   index = index.replace('OG_DYNAMIC_IMAGE', og_image);
  //   index = index.replace('OG_DYNAMIC_THUMB', og_image);
  //   index = index.replace('OG_DYNAMIC_DESC', description);
  //   index = index.replace('TWITTER_DYNAMIC_DESC', description);
  // }
  
  // Changing metas function
  // const setMetas = (title, description) => {
  //     index = index.replace('TWITTER_DYNAMIC_TITLE', title);
  //     index = index.replace('TWITTER_DYNAMIC_DESC', description);
  // }
  
  // Navigation menu
  // if     (path[1] === 'articles')    setMetas('Articles - Erik Martín Jordán', 'Code, web development, tech and off-topic.');
  // else if(path[1] === 'projects')    setMetas('Projects - Erik Martín Jordán', 'Websites I have deployed so far.');
  // else if(path[1] === 'kpis')        setMetas('Kpis - Erik Martín Jordán', 'Numbers and stats.');
  // else if(path[1] === 'timer')       setMetas('Timer - Erik Martín Jordán', 'Tasks I am working on.');
  
  // We need to considerate the routes and a default state to 404 errors as well
  // ...

  
  // Sending index.html    
  error404
    ? response.status(400).send(index)
    : response.status(200).send(index);

});