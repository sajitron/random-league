#!/bin/bash

cd /home/random-league

yarn

yarn tsc

pm2-runtime start ecosystem.config.js
