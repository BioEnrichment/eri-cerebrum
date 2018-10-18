
FROM node:8.12.0-alpine

RUN apk add git python make g++ && \
    mkdir /opt/nodeapp && \
    chown node:node /opt/nodeapp

USER node

COPY package.json /opt/nodeapp
RUN cd /opt/nodeapp && npm install

COPY templates /opt/nodeapp/templates
COPY less /opt/nodeapp/less
COPY public /opt/nodeapp/public
COPY cerebrum.json /opt/nodeapp
COPY tsconfig.json /opt/nodeapp

COPY lib /opt/nodeapp/lib

WORKDIR /opt/nodeapp
RUN npm run tsc

CMD npm start


