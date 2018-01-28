(function() {
    'use strict';

    // ELECTRON Stuff

    const Electron = require('electron');

  const {app, BrowserWindow} = require('electron')
  const {Menu, Tray} = require('electron')
  const nativeImage = require('electron').nativeImage
  let tray = null;
  let mainWindow = null;

  //require('electron-debug')({showDevTools: true});

    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.


    // Quit when all windows are closed.
    app.on('window-all-closed', function() {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform != 'darwin') {
        app.quit();
      }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    app.on('ready', function() {


        let image = nativeImage.createFromPath('images/icon.png')



      tray = new Tray('images/icon.png')
      const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio'},
        {label: 'Item3', type: 'radio', checked: true},
        {label: 'Item4', type: 'radio'}
      ])
      tray.setToolTip('This is my application.')
      //tray.setContextMenu(contextMenu)
      tray.on('click', buildWindow)



      function buildWindow(){

        var cursorPosition = Electron.screen.getCursorScreenPoint();


        console.log("tray clicked")
        // Create the browser window.
       if(!mainWindow)  {
         mainWindow = new BrowserWindow({
          x: cursorPosition.x - 400,
          y: 40,
          frame: false,
          transparent: true,
          width: 800,
          height: 400,
          MinWidth: 500,
          MinHeight: 200,
          resizable: false,
          // 'accept-first-mouse': true,
          // 'title-bar-style': 'hidden'
        })
        //mainWindow.on('blur',buildWindow)
        // Emitted when the window is closed.
        mainWindow.on('closed', function() {
          // Dereference the window object, usually you would store windows
          // in an array if your app supports multi windows, this is the time
          // when you should delete the corresponding element.
          mainWindow = null;
        });
        mainWindow.loadURL('file://' + __dirname + '/index.html');
      }
        else {
          if(mainWindow.isVisible()) mainWindow.hide()
          else mainWindow.show()
        }

      }


      // and load the index.html of the app.
      //mainWindow.loadURL('file://' + __dirname + '/index.html');

      // Open the DevTools.
      //mainWindow.openDevTools();


    });




    // End Electron Stuff






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
