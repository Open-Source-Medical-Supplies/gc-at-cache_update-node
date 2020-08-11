# Pain, lots of pain.

## Setup a dev env
There's a google api-doc page somewhere.

## API Docs
### https://googleapis.dev/nodejs/storage/latest/

## Required keys:
This gFunction requires at minimum an auth key from Airtable in 'at_key.json' and likely needs an oAuth POJO for the (service) account that will be running the script in gCloud.

## Update CORS for bucket
Note: currently set up for prod, prod-test, and localhost:3000 for React.

From this root dir, run:
```
gsutil cors set ./bucket-config.json gs://opensourcemedicalsupplies.org
```

To wipe out the CORS settings (why would you?) run the same command, but w/ a JSON file containing only:
```
[]
```