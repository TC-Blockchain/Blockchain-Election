# Aplicação Blockchain

Instalações necessárias:

Versão Java instalada: 8.0.3210.7

Versão Node instalada: 8.0.0

Versão MySQL Server instalada: 5.7.39

Versão Docker instalada: 4.11.1

Passo a Passo para rodar o Projeto:

1. Com o gitbash ou terminal desejado, vá até o caminho da pasta BlockchainFRONT, execute a aplicação java com o seguinte comando(Lembre-se de trocar a senha do seu banco, se não houver deixe o campo password vazio):


java -Dspring.datasource.username=root -Dspring.datasource.password=SUASENHAAQUI  -jar webapp-runner.jar --port 8080 --expand-war eleicoesonline.war

Informação indicando o exito: Started Boot in 16.208 seconds

2. Acessar endereços da aplicação java:

Primeiro: http://localhost:8080/magic/generate/roles/
Segundo: http://localhost:8080/magic/generate/owner/

O primeiro endereço gera os perfis de acesso da nossa aplicação. O segundo gera um usuário capaz de criar eleições, aprovar candidatos etc.

3. Executando o Sawthooth:

Utilizando o terminal, vá até a pasta BlockchainAPI e execute o comando: 

docker-compose -f sawtooth-default.yaml up

4. Executando a Aplicação JavaScript:

Utilizando o terminal, vá até a pasta BlockchainAPI e execute o comando: 

node index.js
