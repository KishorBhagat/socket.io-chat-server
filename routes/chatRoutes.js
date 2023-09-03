const express = require('express');
const authUser = require('../middlewares/authUser');
const {accessChat, getAllChats, createGroupChat, renameGroup, deleteGroup, addUserToGroup, removeUserFromGroup} = require('../controllers/chatController')

const router = express.Router();

router.post('/', authUser, accessChat)
router.get('/', authUser, getAllChats);
router.post('/group', authUser, createGroupChat);
router.patch('/group', authUser, renameGroup);
router.delete('/group', authUser, deleteGroup);
router.patch('/group/adduser', authUser, addUserToGroup);
router.patch('/group/removeuser', authUser, removeUserFromGroup);

module.exports = router;