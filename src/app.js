import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import productRoutes from "./routes/productRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
const allowedOrigins = [
  "http://localhost:3000",
  "https://precious-sawine-56ed1a.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
// Swagger setup
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
        url: "http://localhost:5000",
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
  apis: ["./src/routes/*.js"], // <-- files containing JSDoc comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/bookings", bookingRoutes);

app.get("/", (req, res) => res.send("API is running..."));




// Cron job: ตรวจสอบ Booking หมดเวลา ทุก 1 นาที


app.listen(5000, () => console.log("Server running on port 5000"));
export default app;
