/**
 * Swagger API Documentation Setup
 * Provides OpenAPI/Swagger documentation for all API endpoints
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevLeap AI API',
      version: '1.0.0',
      description: 'Complete API documentation for DevLeap AI platform',
      contact: {
        name: 'DevLeap Support',
        email: 'support@devleap.ai',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.devleap.ai' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/auth.js',
    './routes/questions.js',
    './routes/execute.js',
    './routes/users.js',
    './routes/ai.js',
    './routes/discuss.js',
    './routes/tracker.js',
  ],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: 0,
      persistAuthorization: true,
      filter: true,
      showRequestHeaders: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
    },
    customCss: `
      .topbar { display: none; }
      .swagger-ui .scheme-container { background: #fff; padding: 20px; }
      .swagger-ui .model-box { background: #f9f9f9; }
    `,
    customCssUrl: null,
  }));

  // JSON endpoint for programmatic access
  app.get('/api/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = { setupSwagger };

/**
 * 
 * Example JSDoc comments for routes:
 * 
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
