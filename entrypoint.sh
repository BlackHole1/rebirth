#!/bin/bash

xvfb-run --listen-tcp --server-num=76 --server-arg="-screen 0 2048x1024x24" node index.js &

sleep 5s

# 转发接口
socat tcp-listen:9223,fork tcp:localhost:9222 &

# 获取node进程的PID
NODE_PID=$(lsof -i:80 | grep node | awk 'NR==1,$NF=" "{print $2}')

echo "node pid: ${NODE_PID}"

# 当entrypoint.sh脚本收到SIGINT、SIGKILL、SIGTERM消息时，对node进程发送SIGTERM消息
trap 'kill -n 15 ${NODE_PID}' 2 9 15

# 等待node进程退出
while [[ -e /proc/${NODE_PID} ]]; do sleep 1; done
