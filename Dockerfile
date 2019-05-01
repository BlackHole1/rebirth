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

# 安装环境以及基本依赖
RUN apt-get install -yq git xvfb nodejs npm lsof --fix-missing
RUN apt-get install -yq \
  wget \
  locales \
  libx11-xcb1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libnss3 \
  libxss1 --fix-missing

# 安装chrome浏览器
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get update
RUN apt-get -yq install google-chrome-stable

# 设置UTF-8
RUN apt-get -yq install ttf-wqy-microhei ttf-wqy-zenhei
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
#RUN npm install --production

# 容器运行启动脚本
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["/etc/www/entrypoint.sh"]
