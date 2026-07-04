#!/bin/bash
cd /home/dmannu/quorin-site2/app && nohup npm run dev < /dev/null > /tmp/frontend.log 2>&1 &
cd /home/dmannu/quorin-site2/backend && nohup npm run dev < /dev/null > /tmp/backend.log 2>&1 &
