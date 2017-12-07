(function() {
    'use strict';

    angular
        .module('app', [

        ]);
})();

(function() {
    'use strict';

    angular
        .module('app')
        .controller('Controller', Controller);

    Controller.$inject = ['$scope'];

    /* @ngInject */
    function Controller($scope) {
        var vm = this;
        var disks = require('nodejs-disks');

        activate();

        function activate() {

          disks.drives(
            function(err, drives) {
              console.log(err,drives)
              disks.drivesDetail(
                drives,
                function(err, data) {
                  console.log("disks:",data);
                  vm.disks = data;
                  $scope.$apply();

                  // for (var i = 0; i < data.length; i++) {
                  //   /* Get drive mount point */
                  //   console.log("mount",data[i].mountpoint);
                  //
                  //   /* Get drive total space */
                  //   console.log("total:",data[i].total);
                  //
                  //   /* Get drive used space */
                  //   console.log("used:",data[i].used);
                  //
                  //   /* Get drive available space */
                  //   console.log("avail:",data[i].available);
                  //
                  //   /* Get drive name */
                  //   console.log("name:",data[i].drive);
                  //
                  //   // /* Get drive used percentage */
                  //   // console.log("used%:".data[i].usedPer);
                  //   //
                  //   // /* Get drive free percentage */
                  //   // console.log("free%:",data[i].freePer);
                  // }




                }
              );
            }
          )
        }
    }
})();
