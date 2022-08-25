'use strict'

const { createHash } = require('crypto')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const {Decoder} = require('cbor')
const {calculateVoteAddress,handlerInfo} = require('./infra');
const {InvalidTransaction} = require('sawtooth-sdk/processor/exceptions')

//SMART CONTRACT, AQUI SERIA INSERIDO TODA A LÓGICA, REGRA DE NEGÓCIO EM CIMA DA BLOCKCHAIN.

// Encoding helpers and constants
const getAddress = (key, length = 64) => {
  return createHash('sha512').update(key).digest('hex').slice(0, length)
}

const encode = obj => Buffer.from(JSON.stringify(obj, Object.keys(obj).sort()))

class VoteNHandler extends TransactionHandler { //Herda de uma classe do sawthoot, um tratador de transações
  constructor () {
    console.log('Iniciando smart contract para votos ')
    const info = handlerInfo();
    super(info.family, [info.version], [info.prefix]);// Ele faz o match do header da transação, com handler
  }

  apply (txn, context) {//Todo handler precisa de um apply, recebendo a info da transação e o contexto, que é o objeto que permite ter acesso ao blockchain.
    console.log("chegando uma nova transacao");

    const dataDecoded = Decoder.decodeFirstSync(txn.payload);//Decoder do cbor, faz o decode do payload
    const payload = JSON.parse(dataDecoded);//Objeto gerado através do json

    const blockAddress = calculateVoteAddress(payload)//Endereço calculado de qual endereço registrar o voto.
    const {candidateNumber,ellectionName} = payload;//Numero do candidato e nome da eleição extraídos do payload.
    return context.setState({//Contexto.
      [blockAddress]: encode({candidateNumber,ellectionName})/*Objeto literal: array de endereços associando a informação. Adicionar um novo estado no blockchain do sawtooth,
      informação encodada pelo buffer. Informações: Quem foi votado e a eleição*/
    });

    //throw new InvalidTransaction(); É possível fazer um tratamento e invalidar uma transação utilizando essa exception do sawthoot. com isso ele não registra.
  }
}

module.exports = {
  VoteNHandler
}
