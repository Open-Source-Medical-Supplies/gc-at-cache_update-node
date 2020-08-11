"use strict";

const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const { AT_KEY } = require('./at_key.json');

// airtable config
const config = {
  headers: {
    Authorization: "Bearer " + AT_KEY,
  },
};
const airtableBaseURL = "https://api.airtable.com/v0/apppSjiUMTolFIo1P/";

/**
 * A Table Object to upload
 * 
 * @typedef {Object} TableObject
 * @property {string} encoded - UriEncoded table name for the URL endpoint
 * @property {string} spaced - Table name as it appears in the Airtable tabs
 * @property {string} underscored - Underscored variant of the spaced name, used as the uploaded file's name
 * @property {string} type - String that corresponds to the class / mapping function in the frontend
 */

/**
 * @type {TableObject[]} - Table objects to upload
 */
const airtableURLs = [
  {
    encoded: "Category%20Information",
    spaced: "Category Information",
    underscored: "Category_Information",
    type: 'CategoryInfo'
  },
  {
    encoded: "Medical%20Supply%20Categories",
    spaced: "Medical Supply Categories",
    underscored: "Medical_Supply_Categories",
    type: 'CategorySupply'
  },
  {
    encoded: "Engineered%20Project%20Pages",
    spaced: "Engineered Project Pages",
    underscored: "Engineered_Project_Pages",
    type: 'Project'
  },
  {
    encoded: "ProjectsFilterMenu",
    spaced: "ProjectsFilterMenu",
    underscored: "ProjectsFilterMenu",
    type: 'FilterMenu'
  },
  {
    encoded: "Bill%20of%20Materials",
    spaced: "Bill of Materials",
    underscored: "Bill_of_Materials",
    type: 'Material'
  },
];

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
    JSON.stringify(airtableURLs),
    (e) => fileSaveResponse(e, 'List')
  );

  // add each table's JSON to bucket
  const requests = airtableURLs.map(({encoded, spaced, underscored}) => {
    const tableURL = airtableBaseURL + encoded;
    const fileName = underscored + ".json";
    // initial call GETs JSON dump from airtable base per table
    return axios.get(tableURL, config).then(
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
