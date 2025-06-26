import app from "./app.js";
import mongo_service from "./database/mongo.service.js";

const PORT = process.env.PORT || 5000;

mongo_service();
app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
