#!/usr/bin/env node
/* A simple yet secure client to a CLI-Auth-protected API.
*
*  Copyright @python660, All Rights Reserved.
*  Licensed under the MIT License, attribution
*  required for commercial use. Please see LICENSE.md
*  for more information.
*/

const express = require('express');
const Database = require("@replit/database");
const crypto = require('crypto');
const fs = require('fs');
const { getSignature, verifySignature } = require("./sign.js");

//https://www.youtube.com/watch?v=guwtDGMfk1Y

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let appendQueue = [],
    removeQueue = [];

(async()=>{while (true){
  await delay(100);
  if (appendQueue.length){
    appendQueue.forEach((e)=>{
      //do operation
      try{
        let input = fs.readFileSync(e.filename);
        let authlog = JSON.parse(input);
        if (! authlog[e.key]){
            authlog[e.key] = [];
        }
        authlog[e.key].push(e.value);
        fs.writeFile("auth.json", JSON.stringify(authlog), ()=>{});
        e.resolve();
        removeQueue = removeQueue.slice(1);
      }
      catch(err){
        console.log(err);
        e.reject();
      }
      appendQueue = appendQueue.slice(1);
    });
  }
  if (removeQueue.length){
    removeQueue.forEach((e)=>{
      //do operation
      try{
        console.log(e);
        let input = fs.readFileSync(e.filename);
        let authlog = JSON.parse(input);
        delete authlog[e.content];
        fs.writeFile("auth.json", JSON.stringify(authlog), ()=>{});
        e.resolve();
        removeQueue = removeQueue.slice(1);
      }
      catch(err){
        console.log(err);
        e.reject();
      }
    })
  }
}})();


let authSessions = {}

let app = express();
const expressWs = require('express-ws')(app);

app.use(express.static('static'))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("index.html");
  //res.send("<h2>Fate whispers to the warrior, 'A storm is coming.' The warrior whispers back, 'I am the storm.'</h2><p>Please refer to the <a href='https://'>docs.</p>");
});
app.get('/pubkey.pem', (req, res) => {
  res.sendFile("/home/runner/" + process.env.REPL_SLUG + "/pubkey.pem");
});

app.get('/auth.json', (req, res) => {
  res.sendFile("/home/runner/" + process.env.REPL_SLUG + "/auth.json");
})

app.get('/login', (req, res) => {
  res.render('login.html', { app_name: 'Replit'})
});

app.get('/loggedin', async (req, res) => {
  console.log(req.query);
  console.log(req.headers);
  //console.log(authSessions);
  if (authSessions[req.query.otp] && 
      authSessions[req.query.otp].iat >= new Date() && 
      req.header("X-REPLIT-USER-ID") && 
      req.header("X-REPLIT-USER-NAME")){
    authSessions[req.query.otp].ws.send("auth_resolve:success");
    let authid = crypto.randomUUID();
    res.sendFile("/home/runner/" + process.env.REPL_SLUG + "/views/success.html");
    let payload = JSON.stringify({username: req.header("X-REPLIT-USER-NAME"), id: req.header("X-REPLIT-USER-ID"), authid: authid});
    let signature = btoa(String.fromCharCode(...new Uint8Array(getSignature(payload))));
    await new Promise((resolve, reject) => {appendQueue.push({filename: "auth.json", key: req.header('X-REPLIT-USER-ID'), value: authid, resolve: resolve, reject: reject})});
    authSessions[req.query.otp].ws.send(
      JSON.stringify({
        signature: signature, 
        payload: payload
      })
    );
  }
  else{
    res.sendFile("/home/runner/" + process.env.REPL_SLUG + "/views/failure.html");
  }
});

app.get('/revoke', (req, res) => {
    res.render('revoke.html');
});

app.get('/api/revoke', async (req, res) => {
    await new Promise((resolve, reject) => {removeQueue.push({filename: "auth.json", content: req.header('X-REPLIT-USER-ID'), resolve: resolve, reject: reject})});
    res.render('success.html');
})

app.ws('/auth', (ws, req) => {
  //console.log(ws);
  console.log("connected");
  let uuid = crypto.randomUUID();
  ws.uuid = uuid;
  authSessions[uuid] = {iat: new Date((new Date()).getTime() + 300*60000), ws: ws};
  ws.send('auth_challenge:5:https://cliauth.repl.co/login?otp=' + uuid);
  ws.on('message', function(message){console.log(message)})
  let timeout = setTimeout(function() {
    ws.send("auth_resolve:timeout")
    ws.close();
  }, 300000); // five minutes

  // Trash management
  ws.on('close', function(){
    delete authSessions[ws.uuid];
    clearTimeout(timeout);
  });
});

app.listen(3000, () => {
  console.log('server started');
});
