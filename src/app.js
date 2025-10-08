import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:1000",
  "https://precious-sawine-56ed1a.netlify.app",
  "https://68e6ab0623f5e20008244850--precious-sawine-56ed1a.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Product Booking API",
      version: "1.0.0",
      description: "API for Product Booking system",
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/bookings", bookingRoutes);

app.get("/", (req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
 