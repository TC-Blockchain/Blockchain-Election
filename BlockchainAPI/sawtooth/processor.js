'use strict'

/*ZeroMQ é uma biblioteca de mensagens assíncronas, destinada ao uso em aplicativos distribuídos ou simultâneos.
Ele fornece uma fila de mensagens, mas, diferentemente do middleware orientado a mensagens,
um sistema ZeroMQ pode ser executado sem um intermediário de mensagens dedicado; o zero no nome é para zero broker.*/

const { TransactionProcessor } = require('sawtooth-sdk/processor');//Import do módulo do sawthoot.
const VALIDATOR_URL = 'tcp://localhost:4004';

module.exports = (handler) => {
  const tp = new TransactionProcessor(VALIDATOR_URL)/*Utiliza um servidor de mensageria, ZeroMQ, 
  é passado pro processo qual endereço que o ZeroMQ tá escutando na porta:4004 através do protocolo tcp.*/
  tp.addHandler(handler)//Registra o handler
  tp.start()/*Uma vez que o handler tá registrado no processo, dá o start no handler, onde ele escuta novas transações
  e transações que batam com as informações de familia,versão e prefixo.*/
}
