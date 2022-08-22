'use strict'

const cbor = require('cbor')
const {buildSawtoothPackage,sendToSawtoothApi} = require('./infra');

const registerBlockchain = (payload) => {
    //Função que irá registrar o payload(voto) no sawtooth(blockchain)
    console.log(payload);

    //Aqui é feito o encode e a geração da sequencia de bytes.
    const payloadBytes = cbor.encode(JSON.stringify(payload));

    /*Responsável por pegar o payload transformado em um array de bytes, e envelopá-los
    numa estrutura específica do sawtooth, serializando essa informação e deixando pronta para ser trabalhada na rede.
    É necessário a chave privada do usuário para criar esse envelopamento*/
    const batchBytes = buildSawtoothPackage(payloadBytes,payload.userNumber);

    /*Função pronta que executa os passos necessários para se comunicar com a api http do
    sawtooth, pra enviarmos o payload. Onde é esperado um array de bytes que contém os payloads.*/
    sendToSawtoothApi(batchBytes);
}

module.exports = { registerBlockchain }
