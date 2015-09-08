// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("deleteUser", function (request, response) {

    if(request.user) {

        (new Parse.Query(Parse.Role)).equalTo("users", request.user)
            .find({
                success: function (roles) {
                    var allowedRoles = roles.filter(function (item) {
                        return item.get("name") === "Administrators" ||
                            item.get("name") === "Managers";
                    });

                    if(allowedRoles.length > 0) {
                        Parse.Cloud.useMasterKey();
                        var query = new Parse.Query(Parse.User);
                        query.get(request.params.objectId, {
                            success: function (user) {
                                user.destroy({
                                    success: function (myObject) {
                                        response.success("User deleted successfully");
                                    },
                                    error: function (error) {
                                        response.error("Error deleting user");
                                    }
                                });
                            },
                            error: function (error) {
                                response.error("User is not found");
                            }
                        });
                    } else {
                        response.error("Disallowed to delete");
                    }
                },
                error: function(error) {
                    response.error("Cannot check your roles.")
                }}
        );
    } else {
        response.error("You are not logged in");
    }
});


Parse.Cloud.define("updateUser", function(request, response) {

        if(request.user) {

            (new Parse.Query(Parse.Role)).equalTo("users", request.user)
                .find({
                    success: function (roles) {
                        var allowedRoles = roles.filter(function (item) {
                            return item.get("name") === "Administrators" ||
                                item.get("name") === "Managers";
                        });

                        if(allowedRoles.length > 0) {
                            Parse.Cloud.useMasterKey();

                            var user = new Parse.User();
                            user.set("name", request.params.name);
                            user.set("username", request.params.username);
                            user.set("email", request.params.email);
                            user.set("objectId", request.params.objectId);
                            user.save(null, {
                                success: function (user) {
                                    response.success("User updated");
                                },
                                error: function (error) {
                                    response.error("User is not updated");
                                }
                            });
                        } else {
                            response.error("Disallowed to delete");
                        }
                    },
                    error: function(error) {
                        response.error("Cannot check your roles.")
                    }}
            );
        } else {
            response.error("You are not logged in");
        }





    }

);
//
//Parse.Cloud.afterDelete(Parse.User, function(request) {
//    query = new Parse.Query("TimeZone");
//    query.equalTo("createdBy", request.object);
//    query.find({
//        success: function(timeZones) {
//            Parse.Object.destroyAll(timeZones, {
//                success: function() {},
//                error: function(error) {
//                    console.error("Error deleting related timezones " + error.code + ": " + error.message);
//                }
//            });
//        },
//        error: function(error) {
//            console.error("Error finding related timezones " + error.code + ": " + error.message);
//        }
//    });
//});


Parse.Cloud.afterSave(Parse.User, function (request) {
    Parse.Cloud.useMasterKey();

    query = new Parse.Query(Parse.Role);
    query.equalTo("name", "Users");
    query.first({
        success: function (object) {

            object.relation("users").add(request.user);

            object.save();

        },
        error: function (error) {
            throw "Got an error " + error.code + " : " + error.message;
        }
    });



// if(request.user.get("username") === "manager") {
//   query = new Parse.Query(Parse.Role);
//   query.equalTo("name", "Managers");
//   query.first ( {
//     success: function(object) {

//       object.relation("users").add(request.user);

//       object.save();

//     },
//     error: function(error) {
//       throw "Got an error " + error.code + " : " + error.message;
//     }
//   });

// }

});


Parse.Cloud.beforeSave("TimeZone", function (request, response) {

    var timeZone = request.object;
    var acl = new Parse.ACL(request.object.get("createdBy"));

    acl.setPublicReadAccess(false);
    acl.setRoleWriteAccess("Administrators", true);
    acl.setRoleReadAccess("Administrators",  true);

    timeZone.setACL(acl);
    response.success();
});


