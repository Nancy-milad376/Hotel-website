//reviewModel.js
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "review",
    {
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { freezeTableName: true, tableName: "reviews" }
  );

  // Update room rating after review is created
  Review.afterCreate(async (review) => {
    const db = require("./index");
    const roomId = review.RoomId;

    const avgRating = await db.Review.findOne({
      where: { RoomId: roomId },
      attributes: [
        [db.sequelize.fn("AVG", db.sequelize.col("rating")), "avgRating"],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "numReviews"],
      ],
      raw: true,
    });

    await db.Room.update(
      {
        rating: avgRating.avgRating,
        numReviews: avgRating.numReviews,
      },
      { where: { id: roomId } }
    );
  });

  return Review;
};
