import ComplaintModel from "../database/schema/complaint.js";
import UserModel from "../database/schema/User.js";

export const getLeaderboardAndStats = async (req, res) => {
  try {
    // Get current user from token
    const currentUser = await UserModel.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const flatCode = currentUser.flatCode;

    // 1. Get all users in same flat with karma points
    const users = await UserModel.find({ flatCode }, "username karmaPoints");

    // 2. Count complaints filed against users in the same flat
    const complaints = await ComplaintModel.aggregate([
      { $match: { flatCode } }, // filter by flat
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          username: "$userInfo.username",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Top complaint categories in this flat
    const topCategories = await ComplaintModel.aggregate([
      { $match: { flatCode } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      status: "success",
      karmaBoard: users.map((u) => ({
        name: u.username,
        karmaPoints: u.karmaPoints,
      })),
      mostComplained: complaints,
      topCategories,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

