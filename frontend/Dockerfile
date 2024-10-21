FROM node:18

WORKDIR /usr/src/app

EXPOSE 5173

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
# CMD ["npm", "run", "build"]
