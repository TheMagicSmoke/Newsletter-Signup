// requiring all the necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();

app.use(bodyParser.urlencoded({extended : true})); // initializing body parser for use
/*
When the client browser makes a GET request to get the signup page, since the server has to send static files
like styles.css and an image, it cannot send all of this over sendFile() function. Instead a new folder public
has been created and this stores all these stylesheets and images that are required to represent any webpage
other than the html files. The below command initialises this folder so that the server automatically sends all
the static files that are related to the particular html file being sent over using the sendFile() function.
*/
app.use(express.static('public'));

// send the signup page when client browser makes a GET request in homepage/ root of server
app.get('/',function(req,res){
  res.sendFile(__dirname + '/signup.html');
});

// handle the POST request by the browser i.e. when user fills the signup form and submits it.
app.post('/',function(req,res){
  // the data of the form is gathered. Below syntax is possible because of body parser module used here.
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

/* defining a custom JS object with the format mentioned in the Mailchimp API Docs. The parameters defined
here are named as per the API Docs. */
  const data = {
    members : [{
      email_address : email, // the email id that was retrieved from the signup form filled by user
      status : 'subscribed',
      merge_fields : {
        // the first and last name filled in the form.
        FNAME : firstName,
        LNAME : lastName
      }
    }]
  };

// convert the created JS object to JSON as Mailchimp accepts JSON only.
const jsonData = JSON.stringify(data);

/*The API endpoint. The number at the end after the '/' is the list ID. It can be obtained by creating
a Mailchimp account for using its API */
const url = 'https://usX.api.mailchimp.com/3.0/lists/';

/* another JS object. This is required to make a POST request to the Mailchimp server to submit the details of
the signup form filled by the user. Its format is as per the https node module docs. The auth parameter is the
authentication, which is necessary to authenticate your API request to the mailchimp server as per their docs.
You can put anything before the ':', and the API key comes after that. Note that if API key ends with 'us10'.
The API endpoint url also should start with 'us10' after the 'https://' as visible above. This is as per
Mailchimp docs. So if it was 'us5' instead of 'us10' , then the same should be written for both the endpoint
and the API key.
*/
const options = {
  method : 'POST',
  auth : 'xyz:'
};

/*
To send the POST request using the request method of the https module , you have to call the method and save
its return value to a variable. the request() method returns a JS object.
*/
const request = https.request(url, options, function(response) {
  // if request is successful, send the success page to the client browser else send the failure page.
  if (response.statusCode === 200) res.sendFile(__dirname + '/success.html');
  else res.sendFile(__dirname + '/failure.html');
  response.on('data', function(data) {
    // log the response data received from Mailchimp server after parsing it from HEX to readable text
    console.log(JSON.parse(data));
  });
});

/*
The object returned by the request() method has a method called write() which is used to pass the JSON that
needs to be sent to the Mailchimp server followed by the end() method call to mark the end of the POST request.
The callback function defined in the request method call gets executed only after the two lines below. This is
obvious because you cannot get a response from the Mailchimp server without sending them the data. The Js object
returned by the request() method probably contains the callback method defined in it which gets executed after
the end() method. To verify the details, you have to go through the code of request method of the https node module.
*/
request.write(jsonData);
request.end();
});


// handle the POST request from the failure html page if failure in signing up happens.
app.post('/failure',function(req,res){
  res.redirect('/'); //redirects browser to the root of the server i.e. the signup.html page
});


// start the express server
/*
Since this server will be hosted on Heroku, mentioning the port as 3000 will not work as heroku might
not have a port 3000 for use. Instead writing `process.env.PORT` makes sure that Heroku assigns its own
port dynamically during deployment. Heroku uses the process JS object to do so. But 3000 has still been
mentined with a OR operator, this is so that the project can be hosted locally as well. So when it is running
at Heroku, `process.env.PORT` is used by Heroku services to assign a port but in case of hosting it locally
on the system, `process.env.PORT` will not help to assign a port so the second option i.e. 3000 will be used
as the port
*/
app.listen(process.env.PORT || 3000,function(){
  console.log('Server running at port 3000');
});
