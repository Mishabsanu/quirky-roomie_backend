import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaint.js";
import usersRoutes from "./routes/users.js";
import getConfigs from "./config/config.js";
import cron from "node-cron";
import ComplaintModel from "./database/schema/complaint.js";
const Configs = getConfigs();

const app = express();
app.use(express.json());
var corsOptions = {
  origin: Configs.cors.origin,
  optionsSuccessStatus: 200,
  credentials: Configs.cors.credentials,
};
app.use(cors(corsOptions));

// Routes
// Auto-archive cron job
cron.schedule("0 0 * * *", async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const complaints = await ComplaintModel.find({
    isArchived: false,
    createdAt: { $lte: threeDaysAgo },
  });

  for (const comp of complaints) {
    if (comp.downvotes.length > comp.upvotes.length) {
      comp.isArchived = true;
      await comp.save();
      console.log(`Auto-archived: ${comp.title}`);
    }
  }
});
cron.schedule("0 0 1 * *", async () => {
  try {
    const topUsers = await User.find().sort({ karmaPoints: -1 }).limit(1);
    if (topUsers.length === 0) return;
    const topUser = topUsers[0];
    if (!topUser.badges.includes("Best Flatmate")) {
      topUser.badges.push("Best Flatmate");
      await topUser.save();
      console.log(`🏆 Badge awarded to ${topUser.username}`);
    }
    await User.updateMany({}, { $set: { karmaPoints: 0 } });
  } catch (err) {
    console.error("Monthly badge cron failed", err);
  }
});

const punishments = [
  "Didn’t clean the dishes? You’re making chai for everyone for a week.",
  "Blasted loud music at 2 AM? You owe everyone samosas.",
  "Left the bathroom dirty? You’re on mop duty for 2 days.",
  "Used up all the WiFi? You're on hotspot duty.",
];


cron.schedule("0 1 * * *", async () => {
  const complaints = await ComplaintModel.find({
    isResolved: false,
    punishment: null,
    $expr: { $gte: [{ $size: "$upvotes" }, 2] },
  });

  for (const comp of complaints) {
    const randomPunishment =
      punishments[Math.floor(Math.random() * punishments.length)];
    comp.punishment = randomPunishment;
    await comp.save();
    console.log(`Punishment assigned to "${comp.title}"`);
  }
});

app.use(`/api/${Configs.server.version}/auth`, authRoutes);
app.use(`/api/${Configs.server.version}/complaints`, complaintRoutes);
app.use(`/api/${Configs.server.version}/users`, usersRoutes);

export default app;
