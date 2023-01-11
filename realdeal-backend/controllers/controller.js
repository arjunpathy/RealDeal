const userService = require("../services/BlogService");


exports.createBlog = async (req, res) => {
    try {
      const blog = await blogService.createBlog(req.body);
      res.json({ data: blog, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
   