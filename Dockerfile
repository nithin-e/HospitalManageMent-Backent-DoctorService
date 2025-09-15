FROM node:20-alpine

WORKDIR /app

# Copy package.json & install deps
COPY DoctorService/package*.json ./DoctorService/
RUN cd DoctorService && npm install

# Copy service + shared folder into image
COPY DoctorService ./DoctorService
COPY shared ./shared

WORKDIR /app/DoctorService

# Build TypeScript
RUN npm run build

# Copy proto files
RUN mkdir -p "dist/DoctorService/src/proto" && \
    cp -r src/proto/* "dist/DoctorService/src/proto/"

VOLUME ["/opt/shared-baserepo"]

EXPOSE 7000
CMD ["node", "dist/DoctorService/src/server.js"]