const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/comment.controller');

// Comments API
router.post('/:blogId', auth, ctrl.create);
router.get('/:blogId', ctrl.listByBlog);
router.patch('/:id/like', auth, ctrl.toggleLike);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;