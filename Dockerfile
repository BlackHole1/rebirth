FROM ubuntu:18.04

MAINTAINER Black-Hole<158blackhole@gmail.com>

# 设置源
RUN sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN apt-get clean
RUN apt-get update -yq

# 设置时区
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get install -yq tzdata --fix-missing
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

# 安装环境，如果一次安装过多时，会出现安装失败的情况
RUN apt-get install -yq git
RUN apt-get install -yq xvfb
RUN apt-get install -yq nodejs
RUN apt-get install -yq npm
RUN apt-get install -yq lsof

# 安装基本依赖
RUN apt-get install -yq wget
RUN apt-get install -yq locales
RUN apt-get install -yq libx11-xcb1
RUN apt-get install -yq libxrandr2
RUN apt-get install -yq libasound2
RUN apt-get install -yq libpangocairo-1.0-0
RUN apt-get install -yq libatk1.0-0
RUN apt-get install -yq libatk-bridge2.0-0
RUN apt-get install -yq libgtk-3-0
RUN apt-get install -yq libnss3
RUN apt-get install -yq libxss1

# 安装chrome浏览器
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get update
RUN apt-get install -yq google-chrome-stable

# 设置UTF-8
RUN apt-get install -yq ttf-wqy-microhei ttf-wqy-zenhei
RUN locale-gen zh_CN.UTF-8 \
  && dpkg-reconfigure locales
RUN locale-gen zh_CN.UTF-8
ENV LANG zh_CN.UTF-8
ENV LANGUAGE zh_CN:zh
ENV LC_ALL zh_CN.UTF-8

# 设置工作目录
WORKDIR /etc/www

# 配置开发环境
RUN npm install -g node-gyp
COPY src ./
RUN npm config set registry https://repos.saybot.net/repository/alo7npm/
RUN npm install --production

COPY ffmpeg_sources/ /usr/local/bin
RUN chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe

# 容器运行启动脚本
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/etc/www/entrypoint.sh"]
