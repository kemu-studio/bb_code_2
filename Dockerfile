FROM node:12.16.1-alpine as builder
WORKDIR /opt/bb2

COPY ./* /opt/bb2/
RUN  npm install

CMD ["npm", "run", "test"]
