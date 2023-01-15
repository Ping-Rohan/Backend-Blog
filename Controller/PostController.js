const CatchAsync = require("../ErrorHandler/CatchAsync");
const Post = require("../Model/PostModel");

exports.post = CatchAsync(async (request, response) => {
  request.body.author = request.user._id;
  if (request.files) {
    request.body.photos = request.files.map((el) => el.path);
  }

  const post = await Post.create(request.body);
  response.status(200).json({
    message: "Post created successfully",
    post,
  });
});

exports.like = CatchAsync(async (request, response, next) => {
  let alreadyLiked = false;
  let document;

  const post = await Post.findById(request.params.id);

  if (post.likes.includes(request.user._id)) alreadyLiked = true;

  if (alreadyLiked) {
    document = await Post.findByIdAndUpdate(
      request.params.id,
      {
        $pull: { likes: request.user._id },
      },
      { new: true }
    );
  } else {
    document = await Post.findByIdAndUpdate(
      request.params.id,
      {
        $push: { likes: request.user._id },
      },
      { new: true }
    );
  }

  response.status(200).json({
    likes: document.likes.length,
  });
});

exports.getPostById = CatchAsync(async (request, response, next) => {
  const post = await Post.findById(request.params.id);
  response.status(200).json({
    post,
  });
});

exports.updatePost = CatchAsync(async (request, response, next) => {
  const post = await Post.findOneAndUpdate(
    { _id: request.params.id, author: request.user._id },
    request.body,
    { runValidators: true, new: true }
  );
  response.status(200).json({
    message: "Post Updated",
    post,
  });
});

exports.deletePost = CatchAsync(async (request, response, next) => {
  await Post.findOneAndRemove({
    _id: request.params.id,
    author: request.user._id,
  });
  response.status(200).json({
    message: "Post deleted successfully",
  });
});
