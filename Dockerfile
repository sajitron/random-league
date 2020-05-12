FROM node:12.16-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git curl openssh make python \
    busybox-extras yarn

RUN yarn global add pm2
#
RUN mkdir -p /home/random-league

# COPY package*.json ./
#
COPY . /home/random-league

WORKDIR /home/random-league

EXPOSE 7300
#
ADD docker-entrypoint.sh /usr/local/bin/
#
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
#
CMD ["/usr/local/bin/docker-entrypoint.sh"]
