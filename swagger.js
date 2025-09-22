// swagger.js
const swaggerAutogen = require('swagger-autogen')();
const glob = require('glob');

// Auto-detect semua file routes dengan normalisasi path
const routeFiles = glob.sync('./app/router/*.js').map((file) => {
  // Normalisasi path untuk menghindari masalah dengan Windows
  return file.replace(/\\/g, '/');
});

console.log('Routes detected:', routeFiles);

const doc = {
  info: {
    version: '1.0.0',
    title: 'API Documentation Siketan',
    description: 'API Documentation Siketan'
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints'
    }
  ],
  securityDefinitions: {},
  definitions: {}
};

const outputFile = './docs/swagger-output.json';

swaggerAutogen(outputFile, routeFiles, doc)
  .then(() => {
    console.log('Swagger documentation generated successfully!');
  })
  .catch((err) => {
    console.error('Error generating swagger documentation:', err);
  });
