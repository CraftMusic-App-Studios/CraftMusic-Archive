/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : shard.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 3. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { ShardingManager } = require("discord.js");
const config = require('./config.json');

const shards = new ShardingManager("./server.js", {
    token: config.token,
    totalShards: 3
});

shards.on("shardReady", shard => {
    console.log(`[${new Date().toString().split(" ", 5).join(" ")}] Shard [ #${shard.id} ] wurde hochgefahren.`)
});

shards.spawn(shards.totalShards, 5000);
