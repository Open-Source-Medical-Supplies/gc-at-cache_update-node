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
const airtableURLs = [
  {
    encoded: "Category%20Information",
    spaced: "Category Information",
    underscored: "Category_Information"
  },
  {
    encoded: "Medical%20Supply%20Categories",
    spaced: "Medical Supply Categories",
    underscored: "Medical_Supply_Categories"
  },
  {
    encoded: "Engineered%20Project%20Pages",
    spaced: "Engineered Project Pages",
    underscored: "Engineered_Project_Pages"
  },
  {
    encoded: "ProjectsFilterMenu",
    spaced: "ProjectsFilterMenu",
    underscored: "ProjectsFilterMenu"
  },
  {
    encoded: "Bill%20of%20Materials",
    spaced: "Bill of Materials",
    underscored: "Bill_of_Materials"
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
      (_) => {
        console.log(spaced + " failed at airtable GET");
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
