# VideoCallTwilio
twilio video call that requires enhancement

I am noob so i might be wrong to not find the events of twilio. However, following are the things that i found need attention:



 <b>I couldn't find any method to reject the outgoing call on failure. </b>
 <b>Once i invite to conversation. It rings on another phone but after timeout, it shows calling on there.</b>
 <b>However here it already falied to connect. Once, failure to connect from this end. It should reject the invitation.</b>
 
 
`conversationsClient.inviteToConversation(uid, options).then(  `

       conversationStarted,
        function(error) {
          // I couldn't find any method to reject the outgoing call on failure. 
          // Once i invite to conversation. It rings on another phone but after timeout, it shows calling on there
          // However here it already falied to connect. Once, failure to connect from this end. It should reject the invitation.
            //something like invite.reject() here on error.
            $scope.modal1.hide();
            window.location.reload();
        }
    );`
    
