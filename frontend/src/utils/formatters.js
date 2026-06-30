export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

export const formatMonthYear = (month, year) => {
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#FF6384' },
  { name: 'Transportation', icon: '🚗', color: '#36A2EB' },
  { name: 'Shopping', icon: '🛍️', color: '#FFCE56' },
  { name: 'Entertainment', icon: '🎬', color: '#4BC0C0' },
  { name: 'Bills & Utilities', icon: '💡', color: '#9966FF' },
  { name: 'Healthcare', icon: '🏥', color: '#FF9F40' },
  { name: 'Education', icon: '📚', color: '#FF6384' },
  { name: 'Travel', icon: '✈️', color: '#36A2EB' },
  { name: 'Personal Care', icon: '💆', color: '#FFCE56' },
  { name: 'Investments', icon: '📈', color: '#4BC0C0' },
  { name: 'Income', icon: '💰', color: '#22C55E' },
  { name: 'Other', icon: '📦', color: '#95A5A6' }
];

export const getCategoryMeta = (name) => CATEGORIES.find(c => c.name === name) || { icon: '📦', color: '#95A5A6' };
