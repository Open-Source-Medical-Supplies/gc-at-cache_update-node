"use strict";

/**
 * A Table Object to upload
 * 
 * @typedef {Object} TableObject
 * @property {string} encoded - UriEncoded table name for the URL endpoint
 * @property {string} spaced - Table name as it appears in the Airtable tabs
 * @property {string} underscored - Underscored variant of the spaced name, used as the uploaded file's name
 * @property {string} type - Corresponds to the class / mapping function in the frontend
 * @property {string} view - The airtable view to query
 */


const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const { AT_KEY } = require('./at_key.json');

// airtable config
const httpConfig = {
  headers: {
    Authorization: "Bearer " + AT_KEY,
  },
};
const airtableBaseURL = "https://api.airtable.com/v0/apppSjiUMTolFIo1P/";
/**
 * @type {TableObject[]} - Table objects to upload
 */
const airtableConfig = require("./airtable_config.json")

// Bucket config
const projectId = "osms-website";
const keyFilePath = "./key.json";
const storage = new Storage({ projectId, keyFilePath });
const bucket = storage.bucket("opensourcemedicalsupplies.org");

// utils
const fileSaveResponse = (e, name = '') => {
  e
    ? console.log(name + " failed at bucket POST", e)
    : console.log(name + " uploaded");
};

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.update = (req, res) => {
  // add list of tables to bucket for frontend to programatically reference
  const listFile = bucket.file('table_list.json');
  listFile.save(
    JSON.stringify(airtableConfig),
    (e) => fileSaveResponse(e, 'List')
  );

  // add each table's JSON to bucket
  const requests = airtableConfig.map(({encoded, spaced, underscored, view}) => {
    const tableURL = airtableBaseURL + encoded + `?view=${view}`;
    const fileName = underscored + ".json";
    // initial call GETs JSON dump from airtable base per table
    return axios.get(tableURL, httpConfig).then(
      ({data}) => {
        // create gFile
        const newFile = bucket.file(fileName);
        // upload gFile
        return newFile.save(
          JSON.stringify(data.records), 
          (e) => fileSaveResponse(e, spaced)
        );
      },
      (e) => {
        console.log(spaced + " failed at airtable GET", e);
      }
    );
  });

  Promise.all(requests).then(
    (v) => {
      console.log("Operation completed", v);
      res.status(200).send("Operation complete");
    },
    (e) => {
      console.log("Operation failed", e);
      res.status(400).send("Operation failed");
    }
  );
};
