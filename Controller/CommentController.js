const CatchAsync = require("../ErrorHandler/CatchAsync");
const Comment = require("../Model/CommentModel");

exports.createComment = CatchAsync(async (request, response, next) => {
  request.body.commentedBy = request.user._id;
  request.body.commentedOn = Date.now();
  request.body.post = request.params.id;
  const comment = await Comment.create(request.body);
  response.status(200).json({
    comment,
  });
});
