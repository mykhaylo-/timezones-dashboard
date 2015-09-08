(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController)
        .controller('NewTimezonePopupController', NewTimezonePopupController);

    /** @ngInject */
    function HomeController($scope, $log, $interval, $window, $modal, toaster) {

        var vm = this;
        vm.format = "HH:mm:ss";
        vm.localTime = new Date().getTime();
        vm.timezones = [];
        $interval(function() {
            vm.localTime = vm.localTime + 1000;
            vm.timezones.forEach(function(entry) {
               entry.localTime = entry.localTime + 1000;
            });
        }, 1000);
        activate();

        function activate() {
            var TimeZone = Parse.Object.extend("TimeZone");
            var query = new Parse.Query(TimeZone);
            query.equalTo("createdBy", Parse.User.current());
            query.find({
                success: function (results) {
                    $log.info("Successfully retrieved " + results.length + " timezones");
                    vm.timezones = results.map(function (item) {
                        var result = item.toJSON();
                        result.localTime = new Date().getTime();
                        return result;
                    });
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };

        vm.deleteTimezone = function (timezoneIndex) {

            var TimeZone = Parse.Object.extend("TimeZone");
            var timeZone = new TimeZone();
            //timeZone.set("city", vm.timezones[timezoneIndex].city);
            //timeZone.set("name", vm.timezones[timezoneIndex].name);
            //timeZone.set("zoneOffset", vm.timezones[timezoneIndex].zoneOffset);
            timeZone.set("objectId", vm.timezones[timezoneIndex].objectId);

            timeZone.destroy({
                success: function (timeZone) {
                    $log.info("Successfully deleted timeZone " + timeZone.get("name"));
                    vm.timezones.splice(timezoneIndex, 1);
                },
                error: function (timeZone, error) {
                    alert("Error: " + error.code + " " + error.message);
                    toaster.pop('error', "Error", "Error deleting timezone");
                    $log.error(error);
                }
            });
        };

        vm.openTimezonePopup = function (timezone) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'timezonePopup.html',
                controller: 'NewTimezonePopupController',
                controllerAs: 'tzPopupCtrl',
                size: 'sm',
                resolve: {
                    timezone: function () {
                        return angular.copy(timezone);
                    }
                }
            });

            modalInstance.result.then(function (timezone) {
                activate();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

        };
    }


    /** @ngInject */
    function NewTimezonePopupController($modalInstance, timezone, $log, toaster) {
        var vm = this;
        vm.title = timezone ? "Edit timezone" : "New Timezone";
        vm.timezone = timezone ? timezone : {};
        vm.save = function () {
            if (vm.timezone.objectId) {

                var TimeZone = Parse.Object.extend("TimeZone");
                var timeZone = new TimeZone();
                timeZone.set("city", vm.timezone.city);
                timeZone.set("name", vm.timezone.name);
                timeZone.set("zoneOffset", vm.timezone.zoneOffset);
                timeZone.set("objectId", vm.timezone.objectId);
                timeZone.save(null, {
                    success: function (timeZone) {
                        $log.info('Updated timezone with objectId: ' + timeZone.id)
                        $modalInstance.close(timeZone);
                    },
                    error: function (timeZone, error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            } else {
                var TimeZone = Parse.Object.extend("TimeZone");
                var timeZone = new TimeZone();
                timeZone.set("city", vm.timezone.city);
                timeZone.set("name", vm.timezone.name);
                timeZone.set("zoneOffset", vm.timezone.zoneOffset);
                timeZone.set("createdBy", Parse.User.current())
                timeZone.save(null, {
                        success: function (timeZone) {
                            $log.info('Created timezone with objectId: ' + timeZone.id)
                            $modalInstance.close(timeZone);
                        },
                        error: function (timeZone, error) {
                            vm.alert = {type: 'danger', msg: 'Error saving timezone'};
                            //toaster.pop('error', "Error", "Error saving timezone");
                            $log.error(error);
                            alert("Error: " + error.code + " " + error.message);
                        }
                    }
                );
            }
        };

        vm.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        vm.closeAlert = function () {
            vm.alert = undefined;
        }
    };

})();
