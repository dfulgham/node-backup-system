(function() {
    'use strict';


    var schedule = require('node-schedule');
    var nano = require('nano')('http://10.10.0.200:5984/node_backup');
    const uuid = require('uuid/v1');
    var fs = require('fs')
    var os = require('os')

    var configChanges;
    var config;

    // Initialize Backup Agent
    // check for config file, if not exist then create one.
    if (!fs.existsSync('./config')) {
      // create config file
      config = {
        _id: uuid(),
        type: "host",
        name: os.hostname(), // set initial name for host.  This will edited on admin site.
        os: {
          platform: os.platform(),
          net: os.networkInterfaces()
        }
      }

      sendConfig(config);


    } else {
      // config exists load agent id and retrieve config


      fs.readFile('./config', 'utf8',function(err, data) {
        if (err) console.log("file read error:", err);
        else {
          // console.log("config exists", data)
          data = JSON.parse(data)
          // query database and see if there are any new records
          nano.get(data._id,{include_docs: true},function(err,docs){
            // console.log("couchdb error:",err)
            if (err && err.error=="not_found") {
              delete data._rev; // remove revision;
              return sendConfig(data); // no record on the server, so send what we have and follow
            }

            // console.log("database record:",docs)
            if (docs._rev != data._rev) {
              // write new doc to disk
              fs.writeFile("./config", JSON.stringify(docs), function(err) {
                // console.log("changes applied", err)
              })
            }
          })

            // setup config change feed
            configChanges = nano.follow({
              since: "now",
              include_docs: true
            });
            configChanges.filter = function(doc, req) {

              if (doc._id == data._id) return true;
              return false;

            }
            configChanges.on('change', function(change) {
              // console.log("change: ", change);
              //write config to disk
              fs.writeFile("./config", JSON.stringify(change.doc), function(err) {
                // console.log("changes applied", err)
              })

            })

            configChanges.follow();
        }
      })
  }

  function sendConfig(config) {
    nano.insert(config,{include_docs: true}, function(err, data) {
  // console.log("creating database object on initial run or database does not contain record", err, data);
    // get doc
    nano.get(data.id,{include_docs: true}, function(err,docs){

      fs.writeFile("./config", JSON.stringify(docs), function(err) {
        // console.log("changes applied", err,docs)
      })
        // setup config change feed
        configChanges = nano.follow({
          since: "now",
          include_docs: true
        });
        configChanges.filter = function(doc, req) {

          if (doc._id == docs._id) return true;
          return false;

        }
        configChanges.on('change', function(change) {
          // console.log("change: ", change);
          //write config to disk
          fs.writeFile("./config", JSON.stringify(change.doc), function(err) {
            // console.log("changes applied", err)
          })

        })

        configChanges.follow();

    })




  });
  }

}());
