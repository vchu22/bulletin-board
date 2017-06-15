var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletinboard';

app.get('/', function(req,res) {
	res.render('index');
});

app.get('/messages', function(req,res) {
  var allMessages = [];
  pg.connect(connectionString, function(err, client, done) {
    if(err){
      console.log(err);   // error handling
      if(client){
        done(client);
      }
      return;
    }else{
      client.query(`select * from messages`,
        function(err, result) {
        if(err){
          console.log(err);   //error handling
          return done(client);
        }else{
          for(var i=0; i < result.rows.length; i++){
            allMessages.push(result.rows[i]);
          }
          console.log(allMessages);
          res.render('messages', {allMessages})
          done();
          pg.end();
        }
        });
    }
   });
});

app.post('/message', function(req, res) {
  console.log(req.body.title);
  console.log(req.body.messagebody);
  pg.connect(connectionString, function(err,client,done) {
  	if (err) {
  		console.error(err);
  		if (client) {
  			done(client);
  		}
  		return;
  	} else {
  		client.query(`INSERT INTO messages (title, body, commenter) VALUES ($1, $2, $3)`, [req.body.title, req.body.messagebody, req.body.commenter],
      function(err,result) {
	  		if (err) {
		  		console.log(err);
		  		return done(client);
		  	} else {
            res.redirect('/messages');
		  	}
		});
  	}
  })
});

app.listen( 3005, function() {
	console.log('Bulletin Board Codealong listening on port no. 3005.');
});
