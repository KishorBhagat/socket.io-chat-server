const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUser } = require('../controllers/userController');
const authUser = require('../middlewares/authUser');

router.post('/login', loginUser);
router.post('/signup', registerUser);
router.get('/', authUser, getAllUser);

module.exports = router;