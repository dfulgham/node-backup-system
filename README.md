# node-backup-system
NodeJS and CouchDB backup service for Linux and Windows.


## Host Definition
```
  {
    "_id:": "auto_gen when backup app first run",
    "type": "host"
    "_rev": "auto_gen",
    "name": "friendly name",
    "os": {
      "some stats": "from host"
    },
    "storage": true    // is this host also a storage endpoint,
    "jobs": []  // see job definitions next section

  }
```

## Job Definition  

```
 {
    "name": "Descriptive name",
    "tasks": [
      {
        "host_id": "id of host to backup to",
        "catalog_id": "id from catalog definition",
        "backup_host_id": "id of host to backup to id primary unavailable or fails",  //optional
        "schedule": "id from schedule definition",
        "targz": true // weather to tarball and gzip the files or leave in original file structure.
      },
      {
        "host_id": "id of host to backup to",
        "catalog_id": "id from catalog definition",
        "backup_host_id": "id of host to backup to id primary unavailable or fails",  //optional
        "schedule": "id from schedule definition",
        "targz": false // weather to tarball and gzip the files or leave in original file structure.
      }

    ]
  }

  ```

## Catalog Definition
```
{
    "_id": "auto_gen",
    "type": "catalog",
    "name": "a name to descripbe this catalog",
    "fs": [
      {
        "path": "/the/path/to/files",
        "recurse": true,
        "filters": ["file path or name filter regex"],  // regex expression used on path must return truethy or falsethy
        "security": true,
        "opts": []  // options future use
      },
      {
        "path": "/the/path/to/file.txt",
        "recurse": false,
        "filters": null,
        "security": false,
        "opts": []

      }

    ]
  }
```
## Schedule Definition
```
{
    "_id": "auto_gen",
    "type": "schedule"
    "name": "name of schedule",
    "circa": [
      {
        "cron": " cron definition "
      },
      {
        "date": " date and time definition ",
        "repeat": " repeat definition ",   // weekly, daily, monthly, annual, hourly, and compounds like 2 weeks, 6 hours, etc.
        "type": " full / incremental / differential / raw "  // not implemented : for future development
      }
    ]

  }
```
