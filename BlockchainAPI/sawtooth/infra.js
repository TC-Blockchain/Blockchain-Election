const {createHash} = require('crypto')
const {protobuf} = require('sawtooth-sdk')
const {createContext, CryptoFactory} = require('sawtooth-sdk/signing')
const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1')
const request = require('request');

function handlerInfo(){
  const familyName = 'onlinevoting';
  return {
            prefix : getAddress(familyName, 6),// Prefixo Objeto que define onde que a transação pode ser escrita que é a partir da propriedade input e output, getAdress: hash baseado na info passada e quantidade de caracteres.
            family : familyName, //Nome definido
            version :'0.0.1'//Versão de informação
        };
}

function getAddress(key, length) {
  return createHash('sha512').update(key).digest('hex').slice(0, length)
}

function calculateVoteAddress(payload) {
  return handlerInfo().prefix + getAddress(payload.ellectionName,20) + getAddress(payload.userNumber,20) + getAddress(payload.address,24);/*Regra de negócio do endereço:
  Método que calcula o endereço do voto, chamado pelo handler. Todo voto fica dentro desse prefixo + 20 caracteres que define o nome da eleicao + 20 caracteres do usuarios + 24
  caracteres do endereço todos gerados por hash.
  A documentação do sawthoot sugere que vc crie o endereço em função das pesquisas que irá fazer.
  */
}

const getAssetAddress = payload => handlerInfo().prefix + getAddress(payload.ellectionName,20) + getAddress(payload.userNumber,20) + getAddress(payload.address,24)

/*
Post pra o endpoint da api rest do sawtooth, passando o fluxo de bytes com os batches, o header é um stream,
requisição com callback, com resposta e corpo da requisição, onde o corpo é mostrado no console.
*/
function sendToSawtoothApi(batchBytes) {
  request({
      url: 'http://localhost:8008/batches?wait',
      method: 'POST',
      body: batchBytes,
      encoding: null,
      headers: {'Content-Type': 'application/octet-stream'}
    }, (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        const res = new Buffer(response.body, 'base64').toString()
        console.log('Response: ', res);
      }
    })
}

function searchBlockchain(address,callback) {//Endpoint tratado com o JSON que ele retorna
  request({
      url: `http://localhost:8008/state?address=${address}`,
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    }, (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        const items = JSON.parse(response.body).data;//Propriedade data retorna um array

        const decodedInfo = items.map((item) => {//Map para cada uma informação data
          return JSON.parse(new Buffer(item.data, 'base64').toString());//Decodado em base64 e foi criado o objeto
        });

        callback(decodedInfo);
      }
    })
}

function buildSawtoothPackage(payloadBytes,privateKey){

  const context = createContext('secp256k1');
  const privateKeyInstance = Secp256k1PrivateKey.fromHex(privateKey);/*A chave privada chega, em hexa, ele gera uma instancia com a criptografia requirida que é Secp256k1,
  padrão utilizado no bitcoin*/
  const signer = new CryptoFactory(context).newSigner(privateKeyInstance); //Objeto criado em função da chave privada que vai assinar as infos dentro do sawtooth.

  const {family,version,prefix} = handlerInfo(); //O calculo da family,input e output é feito por essa função que tá dentro do votehandler.

  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: family, //Namespace
    //Informações para identificar a transação do blockchain
    familyVersion: version,//
    //Validação de registros que tenham esse prefixo
    inputs: [prefix],
    outputs: [prefix],
    signerPublicKey: signer.getPublicKey().asHex(), //Chave pública de quem solicita registro
    batcherPublicKey: signer.getPublicKey().asHex(), //Chave pública do batch, quem monta o batch é o mesmo que solicita a transação
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex') //Comparação de hash do seu payload que é passado na transação com esse payload que foi regerado com sha512 para validação
  }).finish();

  /*
  Assinatura com a chave privada, com o cabeçalho da transação, onde tem diversas infos.
  */
  const signature = signer.sign(transactionHeaderBytes);

  /*
  Transação gerada
  Objeto protobuf > propriedade transaction> método create
  Onde é passado o header da transação, fluxo de bytes
  A assinatura do header
  Payload, array de bytes gerado no client.js onde foi passado como argumento
  pro buildsawtoothpackage
  */
  const transaction = protobuf.Transaction.create({
      header: transactionHeaderBytes,
      headerSignature: signature,
      payload: payloadBytes
  });


  /*
  Contém os ids de cada uma das transações
  Chave pública do usuário que está solicitando registro na blockchain
  */
  const batchHeaderBytes = protobuf.BatchHeader.encode({
      signerPublicKey: signer.getPublicKey().asHex(),
      transactionIds: [transaction.headerSignature],
  }).finish();

  /* 
  Assinatura. Signer = recebe fluxo de bytes, gera assinado e criptografado. 
  */
  const batchSignature = signer.sign(batchHeaderBytes);

  /*Montagem do batch
  Objeto literal que contém um array de transações,
  assinatura gerada a partir da chave privada garantindo autenticidade,
  cabeçalho onde é um fluxo de bytes */
  const batch = protobuf.Batch.create({
      header: batchHeaderBytes,
      headerSignature: batchSignature,
      transactions: [transaction]
  });

  /*voto = stream de bytes > array de batchs
  protobuf = está dentro do sdk do sawtooth protocolo de serialização
  do google, para integrar aplicações, protocolo binário.*/ 
  const batchBytes = protobuf.BatchList.encode({
      batches: [batch]
  }).finish();

  return batchBytes;
}

module.exports = { buildSawtoothPackage,sendToSawtoothApi,handlerInfo,calculateVoteAddress,searchBlockchain}