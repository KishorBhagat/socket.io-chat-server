const express = require("express");
const authUser = require("../middlewares/authUser");
const {sendMessage, getAllMessages} = require("../controllers/messageController");
const router = express.Router();

router.post('/', authUser, sendMessage);
router.get('/:chatId', authUser, getAllMessages);
module.exports = router;