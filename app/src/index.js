const express = require('express');
const app = express();
const swaggerUI = require('swagger-ui-express')
const swaggerjson = require('./swagger.json')

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(express.json());

// swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerjson));

// Routes
app.use('/api/v1', require('./routes/ipcollector'));
app.use('/api/v1', require('./routes/users'));

// Starting the server
app.listen(app.get('port'), () => {
  console.log(`Server on port ${app.get('port')}`);
});