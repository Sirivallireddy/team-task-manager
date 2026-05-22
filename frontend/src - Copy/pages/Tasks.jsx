import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiCheckSquare, FiCalendar, FiFolder } from 'react-icons/fi';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await tasksAPI.getMyTasks(params);
      setTasks(response.data.data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await tasksAPI.updateStatus(taskId, status);
      fetchTasks();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
        <p className="text-gray-500">Tasks assigned to you across all projects</p>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'todo', 'in-progress', 'review', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="bg-white rounded-xl shadow-sm">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <FiCheckSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800">No tasks found</h3>
            <p className="text-gray-500 mt-1">
              {filter === 'all' 
                ? "You don't have any assigned tasks yet" 
                : `No tasks with status "${filter}"`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-4 hover:bg-gray-50 ${isOverdue(task.dueDate, task.status) ? 'bg-red-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Link 
                        to={`/projects/${task.projectId}`}
                        className="flex items-center hover:text-primary-600"
                      >
                        <FiFolder className="mr-1" size={14} />
                        {task.project?.name}
                      </Link>
                      {task.dueDate && (
                        <span className={`flex items-center ${isOverdue(task.dueDate, task.status) ? 'text-red-500 font-medium' : ''}`}>
                          <FiCalendar className="mr-1" size={14} />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          {isOverdue(task.dueDate, task.status) && ' (Overdue)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="ml-4 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
