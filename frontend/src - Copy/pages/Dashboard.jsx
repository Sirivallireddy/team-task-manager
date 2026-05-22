import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, tasksAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  FiFolder, 
  FiCheckSquare, 
  FiAlertCircle, 
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, overdueRes] = await Promise.all([
        dashboardAPI.getStats(),
        tasksAPI.getOverdue()
      ]);
      setStats(statsRes.data.data);
      setOverdueTasks(overdueRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, subValue }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of your projects and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiFolder}
          label="Total Projects"
          value={stats?.overview?.totalProjects || 0}
          color="bg-blue-500"
          subValue={`${stats?.projects?.active || 0} active`}
        />
        <StatCard
          icon={FiCheckSquare}
          label="Total Tasks"
          value={stats?.overview?.totalTasks || 0}
          color="bg-green-500"
          subValue={`${stats?.tasks?.byStatus?.completed || 0} completed`}
        />
        <StatCard
          icon={FiAlertCircle}
          label="Overdue Tasks"
          value={stats?.overview?.overdueTasks || 0}
          color="bg-red-500"
        />
        <StatCard
          icon={FiClock}
          label="Due This Week"
          value={stats?.overview?.tasksDueThisWeek || 0}
          color="bg-yellow-500"
        />
      </div>

      {/* My Stats & Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Assigned</span>
              <span className="font-semibold">{stats?.myStats?.totalAssigned || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">To Do</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">{stats?.myStats?.byStatus?.todo || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{stats?.myStats?.byStatus?.inProgress || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Review</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">{stats?.myStats?.byStatus?.review || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">{stats?.myStats?.byStatus?.completed || 0}</span>
            </div>
            {stats?.myStats?.overdue > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span>Overdue</span>
                <span className="px-2 py-1 bg-red-100 rounded text-sm">{stats?.myStats?.overdue}</span>
              </div>
            )}
          </div>
          <Link 
            to="/tasks" 
            className="block mt-4 text-center text-primary-600 hover:underline"
          >
            View all my tasks
          </Link>
        </div>

        {/* Task Priority Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Priority</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Urgent</span>
                <span className="text-sm text-gray-500">{stats?.tasks?.byPriority?.urgent || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.overview?.totalTasks 
                      ? ((stats?.tasks?.byPriority?.urgent || 0) / stats.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">High</span>
                <span className="text-sm text-gray-500">{stats?.tasks?.byPriority?.high || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.overview?.totalTasks 
                      ? ((stats?.tasks?.byPriority?.high || 0) / stats.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Medium</span>
                <span className="text-sm text-gray-500">{stats?.tasks?.byPriority?.medium || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.overview?.totalTasks 
                      ? ((stats?.tasks?.byPriority?.medium || 0) / stats.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Low</span>
                <span className="text-sm text-gray-500">{stats?.tasks?.byPriority?.low || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.overview?.totalTasks 
                      ? ((stats?.tasks?.byPriority?.low || 0) / stats.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center">
            <FiAlertCircle className="mr-2" />
            Overdue Tasks
          </h2>
          <div className="space-y-3">
            {overdueTasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                to={`/projects/${task.projectId}`}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.project?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-medium">
                    Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                  </p>
                  {task.assignee && (
                    <p className="text-xs text-gray-500">{task.assignee.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.map((task) => (
              <Link
                key={task.id}
                to={`/projects/${task.projectId}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.project?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
