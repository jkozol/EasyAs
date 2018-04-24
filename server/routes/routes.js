//server/routes/routes.js
var express = require('express');
var request = require("request");
var twitterApi = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../../models/User');
var bearerToken = require('../../config.js').bearerToken;
var profile = require('../../profile.json');

router.get('/', function(req, res){
  res.render('index');
});



router.route('/fetchUser')
.post(function(req,res) {
  var user = new User();
  var options = {
    method: 'GET',
    url: twitterApi,
    qs: {
      "screen_name": req.body.name,
      "count": 200,
    },
    json: true,
    headers: {
      "Authorization": "Bearer " + bearerToken
    }
  };

  user.name = req.body.name;
  request(options, function(error, response, body) {
    if (!error) {
      user.tweets = body;

      var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
      var personality_insights = new PersonalityInsightsV3({
        username: '34442ff0-5fd6-4772-ba9e-9e7a1fe3dad5',
        password: 'heBS6eLUnyDQ',
        version_date: '2017-10-13'
      });

      var params = {
        // Get the content from the JSON file.
        content: profile,
        content_type: 'application/json',
        raw_scores: true
      };

      personality_insights.profile(params, function(error, response) {
        if (error)
          console.log('Error:', error);
        else
          console.log(JSON.stringify(response, null, 2));
        }
      );

      user.save(function(err) {
        if (err)
          res.send(err);
        res.send(body);
      });
    }
    else {
      res.status(500).json({ error: error });
    }
  });
});

module.exports = router;
