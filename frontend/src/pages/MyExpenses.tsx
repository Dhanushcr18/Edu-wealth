import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { AcademicCapIcon, ArrowRightOnRectangleIcon, TrashIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

interface Expense {
  id: string;
  category: string;
  itemName: string;
  amount: number;
  description?: string;
  isEssential: boolean;
  createdAt: string;
}

interface ExpenseStats {
  totalSpent: number;
  essentialSpending: number;
  nonEssentialSpending: number;
  savingsOpportunity: number;
  currency: string;
}

const essentialKeywords = [
  'groceries', 'vegetables', 'fruits', 'rice', 'wheat', 'flour', 'dal', 'milk', 'eggs',
  'bread', 'butter', 'oil', 'sugar', 'salt', 'spices', 'lentils', 'beans',
  'apple', 'banana', 'orange', 'mango', 'grapes', 'watermelon', 'papaya', 'pomegranate',
  'tomato', 'potato', 'onion', 'carrot', 'spinach', 'broccoli', 'cabbage',
  'chicken', 'fish', 'meat', 'paneer', 'tofu', 'nuts', 'almonds', 'cashews',
  'medicine', 'doctor', 'hospital', 'medical', 'health insurance', 'treatment', 'pharmacy',
  'rent', 'electricity', 'water bill', 'gas', 'internet bill', 'phone bill', 'maintenance',
  'school fee', 'college fee', 'tuition', 'books', 'stationery', 'uniform', 'study material',
  'transport', 'bus pass', 'metro', 'fuel for work', 'commute', 'petrol for office',
  'salad', 'juice', 'smoothie', 'whole grain', 'protein', 'vitamins', 'green tea',
  'gym membership', 'yoga', 'fitness', 'exercise equipment', 'sports equipment',
  'course', 'learning', 'skill development', 'certification', 'training',
  'laptop for work', 'work equipment', 'professional tools',
];

const wastefulKeywords = [
  'burger', 'pizza', 'fries', 'french fries', 'chips', 'wafers', 'candy', 
  'cake', 'pastry', 'donuts', 'cookies', 'biscuits', 'soda', 'cold drink', 'cola',
  'junk food', 'fast food', 'street food', 'pani puri', 'samosa fried', 'pakora',
  'momos', 'chaat', 'vada pav', 'pav bhaji fried',
  'instant noodles', 'maggi', 'kurkure', 'lays', 'doritos', 'cheetos',
  'cigarette', 'tobacco', 'alcohol', 'beer', 'wine', 'liquor', 'vape',
  'gambling', 'betting', 'lottery',
  'club', 'pub', 'bar', 'party',
  'video game', 'in-game purchase', 'skins', 'loot box',
];

const isExpenseEssential = (category: string, itemName: string, description: string = '') => {
  const text = `${itemName} ${description}`.toLowerCase();
  
  if (essentialKeywords.some(k => text.includes(k))) return true;
  if (wastefulKeywords.some(k => text.includes(k))) return false;
  
  if (category === 'Food & Drinks') return false;
  if (category === 'Entertainment') return false;
  if (category === 'Shopping') return false;
  
  return true;
};

const MyExpenses = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    totalSpent: 0,
    essentialSpending: 0,
    nonEssentialSpending: 0,
    savingsOpportunity: 0,
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'essential' | 'non-essential'>('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses');
      const rawExpenses = response.data.expenses || [];
      
      // Process expenses to add isEssential and calculate stats
      let total = 0;
      let essential = 0;
      let nonEssential = 0;
      
      const processedExpenses = rawExpenses.map((exp: any) => {
        const isEssential = isExpenseEssential(exp.category, exp.itemName, exp.description);
        const amount = Number(exp.amount);
        
        total += amount;
        if (isEssential) {
          essential += amount;
        } else {
          nonEssential += amount;
        }
        
        return {
          ...exp,
          amount,
          isEssential
        };
      });
      
      setExpenses(processedExpenses);
      setStats({
        totalSpent: total,
        essentialSpending: essential,
        nonEssentialSpending: nonEssential,
        savingsOpportunity: nonEssential, // Assuming all non-essential is savings opportunity
        currency: 'INR'
      });
      
    } catch (err: any) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      // Re-calculate local state instead of refetching to be faster
      const updatedExpenses = expenses.filter(exp => exp.id !== id);
      setExpenses(updatedExpenses);
      
      // Recalculate stats
      let total = 0;
      let essential = 0;
      let nonEssential = 0;
      
      updatedExpenses.forEach(exp => {
        total += exp.amount;
        if (exp.isEssential) {
          essential += exp.amount;
        } else {
          nonEssential += exp.amount;
        }
      });
      
      setStats({
        totalSpent: total,
        essentialSpending: essential,
        nonEssentialSpending: nonEssential,
        savingsOpportunity: nonEssential,
        currency: 'INR'
      });
      
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'essential') return expense.isEssential;
    if (filter === 'non-essential') return !expense.isEssential;
    return true;
  });

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'Food & Drinks': '🍔',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Transport': '🚗',
      'Subscriptions': '📱',
      'Others': '📦',
    };
    return emojis[category] || '💰';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="relative">
                <AcademicCapIcon className="h-8 w-8 text-emerald-600 animate-pulse-glow" />
                <div className="absolute inset-0 bg-emerald-400/30 blur-lg rounded-full group-hover:bg-emerald-400/50 transition-all"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                EduWealth
              </span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/add-expense" className="btn btn-primary btn-sm flex items-center space-x-1 shadow-lg">
                <CurrencyRupeeIcon className="h-5 w-5" />
                <span>Track Spending</span>
              </Link>
              <Link to="/dashboard" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all hover:shadow-md">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container-custom py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-8">
          My Expenses 💸
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-3d p-6 backdrop-blur-xl bg-white/80">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ₹{stats.totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="card-3d p-6 backdrop-blur-xl bg-gradient-to-br from-green-50/90 to-emerald-50/90">
            <p className="text-sm text-gray-600 mb-1">Essential Spending</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{stats.essentialSpending.toFixed(2)}
            </p>
          </div>
          <div className="card-3d p-6 backdrop-blur-xl bg-gradient-to-br from-amber-50/90 to-orange-50/90">
            <p className="text-sm text-gray-600 mb-1">Non-Essential</p>
            <p className="text-3xl font-bold text-amber-600">
              ₹{stats.nonEssentialSpending.toFixed(2)}
            </p>
          </div>
          <div className="card-3d p-6 backdrop-blur-xl bg-gradient-to-br from-cyan-50/90 to-teal-50/90">
            <p className="text-sm text-gray-600 mb-1">Savings Opportunity</p>
            <p className="text-3xl font-bold text-cyan-600">
              ₹{stats.savingsOpportunity.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('essential')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'essential'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            Essential
          </button>
          <button
            onClick={() => setFilter('non-essential')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'non-essential'
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            Non-Essential
          </button>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length > 0 ? (
          <div className="space-y-4">
            {filteredExpenses.map((expense, index) => (
              <div
                key={expense.id}
                className="card-3d backdrop-blur-xl bg-white/80 p-6 hover:shadow-xl transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-4xl">{getCategoryEmoji(expense.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{expense.itemName}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            expense.isEssential
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {expense.isEssential ? '✅ Essential' : '⚠️ Non-Essential'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                      {expense.description && (
                        <p className="text-sm text-gray-500 mt-1">{expense.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(expense.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ₹{expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete expense"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-3d backdrop-blur-xl bg-white/80 p-12 text-center">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-600 mb-6">
              {filter !== 'all'
                ? `No ${filter} expenses found`
                : 'Start tracking your spending to see insights here!'}
            </p>
            <Link to="/add-expense" className="btn btn-primary inline-flex items-center space-x-2">
              <CurrencyRupeeIcon className="h-5 w-5" />
              <span>Add Your First Expense</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExpenses;
