const admin = require('firebase-admin');
const fs = require('fs');
const { mergeSchemas } = require('@graphql-tools/schema');
const utilities = require('graphql/utilities');
const { introspectionFromSchema, graphqlSync, getIntrospectionQuery, buildSchema, buildClientSchema } = require("graphql");
const { fromIntrospectionQuery } = require('graphql-2-json-schema');

const adminSchema = require('../admin/api/schema');
const riderSchema = require('../rider/api/schema');
const providerSchema = require("../provider/api/schema");
const settingsSchema = require('../settings/api/schema');
const companySchema = require('../company/api/schema');
const zoneSchema = require('../zone/api/schema');
const vehicleSchema = require('../vehicle/api/schema');
const notificationSchema = require("../notification/api/schema");
const contactUsSchema = require("../contact-us/api/schema");
const providerRequestSchema = require("../provider-request/api/schema");
const walletSchema = require("../wallet/api/schema");
const transactionSchema = require("../transaction/api/schema");
const tripSchema = require("../trip/api/schema");
const rideSchema = require("../ride/api/schema");
const providerPermission = require("../provider-permissions/api/schema");
const reservationSchema = require("../reservation/api/schema");
const promoSchema = require("../promo/api/schema");
const warningSchema = require("../warning/api/schema");
const statSchema = require("../stats/api/schema");

const mergedSchema = mergeSchemas({
  schemas: [adminSchema, riderSchema, providerSchema, settingsSchema, companySchema, zoneSchema, notificationSchema,
    contactUsSchema, providerRequestSchema, walletSchema, vehicleSchema, transactionSchema, tripSchema, rideSchema
    , providerPermission, reservationSchema, promoSchema, warningSchema, statSchema]
});

fs.writeFileSync('schemas.txt', utilities.printSchema(mergedSchema));

const schema = buildSchema(utilities.printSchema(mergedSchema));
const jsonSchema = introspectionFromSchema(schema);
fs.writeFileSync('schemas.json', JSON.stringify(jsonSchema));

