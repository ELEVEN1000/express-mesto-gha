const router = require('express').Router();

const {
  getUserByIdValidator,
  updateAvatarValidator,
  updateProfileValidator,
} = require('../middlewares/validation');

const {
  getUserById,
  updateUser,
  updateUserAvatar,
  getUser,
  getUserInfo,
} = require('../controllers/users');

router.get('/', getUser);
router.get('/:userId', getUserByIdValidator, getUserById);
router.get('/me', getUserInfo);

router.patch('/me', updateProfileValidator, updateUser);

router.patch('/me/avatar', updateAvatarValidator, updateUserAvatar);

module.exports = router;
