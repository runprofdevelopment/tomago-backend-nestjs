const smtp_gmail = {
  email: {
    from: 'apps@runprof.com',
    host: 'smtp.gmail.com',
    // service: 'gmail',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: 'apps@runprof.com',
      serviceClient: key.client_id,
      privateKey: key.private_key,
    },
  },
} 

const smtp_office365 = {
  email: {
    from: 'Decoopa <no-replay@decoopa.com>', 
    host: 'smtp.office365.com',
    port: 587,
    secureConnection: false, // TLS requires secureConnection to be false
    auth: {
      user: 'no-replay@decoopa.com',
      pass: 'Ab@22442244'
    },
    tls: {
      ciphers:'SSLv3'
    },
  },
}

const smtp_domain = {
  email: {
    // name: 'https://companies.saryahapp.com/',
    // debug: true,
    // from: {
    //   name: 'Shamy Stores IDE',
    //   address: 'codes@shamystores.com',
    // },
    from: 'Shamy Stores IDE <codes@shamystores.com>',
    host: 'smtp.domain.com',
    port: 465,
    secure: true,
    auth: {
      user: 'codes@shamystores.com',
      pass: 'Shamy13579'
    },
    tls: {
      rejectUnauthorized: false // do not fail on invalid certs
    },
  },
}