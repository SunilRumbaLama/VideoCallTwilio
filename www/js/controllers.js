angular.module('starter.controllers', [])

.controller('AppCtrl', function() {
})



.controller('SearchCtrl', function($scope, $stateParams,$ionicModal,  $http) {
    var accessToken;
    var conversationsClient;
    var activeConversation;
    var previewMedia;
    var accessToken;

    $scope.$on('$ionicView.beforeEnter', function() {

        $http({
                method: 'GET',
                url: 'http://api/token',
                params: {
                    name: 'uniqueidentityToUse'
                }
            })
            .success(function(data, status, headers, config) {
                accessToken = data.token;
                connectTwilio();
            }).error(function(data, status, headers, config) {
                console.log("http error", data);
            });

    })


    $scope.getToken = function(){
       $http({
                method: 'GET',
                url: 'http://api/token',
                params: {
                    name: 'uniqueidentityToUse'
                }
            })
            .success(function(data, status, headers, config) {
                $scope.token = data.token;
            }).error(function(data, status, headers, config) {
                console.log("http error", data);
            });
    }

    function connectTwilio() {
        var accessManager = new Twilio.AccessManager(accessToken);
        conversationsClient = new Twilio.Conversations.Client(accessManager);
        console.log(conversationsClient);
        conversationsClient.listen().then(function() {
            clientConnected();
        }, function(error) {
            console.log('Could not connect to Twilio: ' + error.message);
        });
    }

    // successfully connected!
    function clientConnected() {
        console.log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");

        conversationsClient.on('invite', function(invite) {

            $scope.modal2.show();

            $scope.acceptCall = function() {
                invite.accept().then(conversationStarted);
            }

            $scope.rejectCall = function() {
                $scope.modal2.hide();
                $scope.modal1.hide();
                invite.reject();
                window.location.reload();
            }
        });

        conversationsClient.on('reject', function(invite) {
            console.log('Rejecting invite from: ' + invite.from);
            $scope.modal2.hide();
            $scope.modal1.hide();
            invite.reject();
            window.location.reload();//after disconnection. If i don't reload the whole app. Twilio call will show error
                                      //That error is remote and local media not being attached on caller end
                                      // beingcalled end will have multiple media attached. Some being thumbnail.
        });
    }

    // bind button to create conversation
    $scope.callUser = function(uid) {
        if (activeConversation) {
            activeConversation.invite(uid);

        } else {
            var options = {};
            if (previewMedia) {
                options.localMedia = previewMedia;
            }
            conversationsClient.inviteToConversation(uid, options).then(
                conversationStarted,
                function(error) {
                  // I couldn't find any method to reject the outgoing call on failure. 
                  // Once i invite to conversation. It rings on another phone but after timeout, it shows calling on there
                  // However here it already falied to connect. Once, failure to connect from this end. It should reject the invitation.
                    $scope.modal1.hide();
                    window.location.reload();
                }
            );
        }
    };



    // conversation is live
    function conversationStarted(conversation) {
        $scope.modal1.hide();
        $scope.modal2.hide();
        $scope.finalModal.show();
        console.log(conversation);
        activeConversation = conversation;
            conversation.localMedia.attach('#local-media');
        conversation.on('participantConnected', function(participant) {
            console.log("Participant '" + participant.identity + "' connected");
            participant.media.attach('#remote-media');
        });
        conversation.on('participantDisconnected', function(participant) {
            console.log("Participant '" + participant.identity + "' disconnected");
            $scope.finalModal.hide();
            $scope.finalModal.hide();
            window.location.reload();//after disconnection. If i don't reload the whole app. Twilio call will show error
                                      //That error is remote and local media not being attached on caller end
                                      // beingcalled end will have multiple media attached. Some being thumbnail.

        });
        conversation.on('ended', function(conversation) {
            $scope.finalModal.hide();
            conversation.localMedia.stop();
            conversation.disconnect();
            activeConversation = null;
            $scope.finalModal.hide();
            window.location.reload();//after disconnection. If i don't reload the whole app. Twilio call will show error
                                      //That error is remote and local media not being attached on caller end
                                      // beingcalled end will have multiple media attached. Some being thumbnail.
        });

        $scope.closeModal = function() {
            $scope.finalModal.hide();
            conversation.disconnect();
            window.location.reload();//after disconnection. If i don't reload the whole app. Twilio call will show error
                                      //That error is remote and local media not being attached on caller end
                                      // beingcalled end will have multiple media attached. Some being thumbnail.
        }
        $scope.hangCall = function() {
            $scope.finalModal.hide();
            conversation.disconnect();
            window.location.reload();//after disconnection. If i don't reload the whole app. Twilio call will show error
                                      //That error is remote and local media not being attached on caller end
                                      // beingcalled end will have multiple media attached. Some being thumbnail.
        }
    };

    $ionicModal.fromTemplateUrl('templates/modal-1.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal1 = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modal-2.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal2 = modal;
    });

    $ionicModal.fromTemplateUrl('templates/final-modal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.finalModal = modal;
    });
})


