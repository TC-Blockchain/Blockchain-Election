var restify = require('restify');
const {registerBlockchain} = require('./sawtooth/client');
const processor = require('./sawtooth/processor');
//smart contract
const {VoteNHandler} = require('./sawtooth/voteHandler');//Registrar o handler(smart contract) essa função vem da classe processor.
const request = require('request');
const {searchBlockchain} = require('./sawtooth/infra');

processor(new VoteNHandler());

function registerVote(req, res, next) {
  const voto = req.body;
  registerBlockchain(voto);
 
  res.send(200);
  next();
}

function search(req,res,next){
  const addres = req.params.addres;

  searchBlockchain(addres,(votes) => {//Função que tá dentro do infra, passa o endereço que quer buscar e o callback que recebe o json de volta
    res.send(votes);
    next();
  });
}

var server = restify.createServer();
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.bodyParser());

server.post('/register/vote', registerVote);
server.get('/search/:addres', search);

server.listen(8084, function() {
  console.log('%s listening at %s', server.name, server.url);
});
