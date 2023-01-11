const express = require("express");
const {
  createUser
} = require("../controllers/controller.js");
 
const router = express.Router();
 
// router.route("/").get(getAllBlogs).post(createBlog);
router.route("/user").post(createUser);

router.route("/transaction").post(addTransaction);

 
module.exports = router;