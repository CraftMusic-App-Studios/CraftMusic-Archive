/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : alive.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const express = require('express');

const server = express();

server.all('/', (req, res)=>{
    res.send('Your bot is alive!')
})

function keepAlive(){
    server.listen(3000, ()=>{console.log("Server is Ready!")});
}

module.exports = keepAlive;
