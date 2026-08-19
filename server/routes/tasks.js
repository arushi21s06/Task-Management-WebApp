const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats must come before :id routes to avoid being caught by the param
router.get('/stats', getTaskStats);

router.route('/').get(getTasks).post(createTask);

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;
