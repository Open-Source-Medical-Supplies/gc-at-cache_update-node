# Google Cloud Function to pull Airtable into a Google Bucket
To the result of caching in a higher capacity than Airtable affords

## To Run The Update
### DO NOT CLOSE THE WINDOW IMMEDIATELY
Wait about 5 minutes to be safe

Simply visit - https://us-central1-osms-website.cloudfunctions.net/update_at_cache

When the page loads, a series of requests are fired off to update the buckets.

### Dry Run
If you want to perform a dry run, visit 
https://us-central1-osms-website.cloudfunctions.net/update_at_cache?test=true

This will generate a series of files prepended with 'test_' in the Google Bucket.

If running from the 'test' section of the Google Function cloud interface, you can add it as a JSON object in the body: `{"test": true}`

### Operation Complete Message
The reporting is kind of bad, sorry. It will say "operation complete" almost immediately, but actually takes about 2 minutes. If you look at web developer console in your browser, console logs will report when each call actually completes (or errors out).

## Setup a dev env
There's a google api-doc page somewhere.

## API Docs
https://googleapis.dev/nodejs/storage/latest/

## Required keys:
This gFunction requires at minimum an auth key from Airtable in 'at_key.json' and likely needs an oAuth POJO for the (service) account that will be running the script in gCloud. This part of setup was kind of a hot mess.

## Update CORS for bucket
Note: currently set up for prod, prod-test, and localhost:3000 for React.

From this root dir, run (one line):
```
gsutil cors set ./bucket-config.json gs://opensourcemedicalsupplies.org
```

To wipe out the CORS settings (why would you?) run the same command, but w/ a JSON file containing only:
```
[]
```