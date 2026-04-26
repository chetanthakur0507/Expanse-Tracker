import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSummary, getByCategory, getMonthly, getTransactions, syncRecurringTransactions } from '../utils/api'
import { exportToPDF } from '../utils/pdfExport'
import AddTransaction from '../components/AddTransaction'
import BudgetGoals from '../components/BudgetGoals'
import CategoryPieChart from '../components/Charts/PieChart'
import MonthlyBarChart from '../components/Charts/BarChart'
import TransactionList from '../components/TransactionList'
import './Dashboard.css'

const CURRENT_MONTH = new Date().getMonth() + 1
const CURRENT_YEAR = new Date().getFullYear()

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 })
  const [catData, setCatData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [transactions, setTransactions] = useState([])
  const [txnLoading, setTxnLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [month, setMonth] = useState('all')
  const [year, setYear] = useState('all')

  const fetchAll = useCallback(async () => {
    try {
      setTxnLoading(true)
      setLoadError('')
      const filterParams = {}
      if (month !== 'all') filterParams.month = month
      if (year !== 'all') filterParams.year = year

      await syncRecurringTransactions()

      const [sumRes, catRes, monthRes, txnRes] = await Promise.all([
        getSummary(filterParams),
        getByCategory(filterParams),
        getMonthly(),
        getTransactions({ ...filterParams, limit: 100 }),
      ])
      setSummary(sumRes.data)
      setCatData(catRes.data)
      setMonthlyData(monthRes.data)
      setTransactions(txnRes.data.transactions)
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Dashboard data load nahi ho paya')
    } finally {
      setTxnLoading(false)
    }
  }, [month, year])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handlePDF = async () => {
    setPdfLoading(true)
    try {
      exportToPDF(transactions, summary, user?.name)
    } catch {}
    setPdfLoading(false)
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>Namaste, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="dash-sub">Selected period ka financial health dekho</p>
        </div>
        <div className="dash-actions">
          <select
            className="form-input month-filter"
            value={month}
            onChange={e => setMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m} {year}</option>
            ))}
          </select>
          <select
            className="form-input month-filter"
            value={year}
            onChange={e => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            className="btn btn-ghost"
            onClick={handlePDF}
            disabled={pdfLoading || transactions.length === 0}
          >
            {pdfLoading ? 'Generating...' : '📄 Export PDF'}
          </button>
        </div>
      </div>

      {loadError && <div className="error-msg" style={{ marginBottom: '14px' }}>{loadError}</div>}

      <div className="stat-grid">
        <div className="stat-card card income-card">
          <div className="stat-icon">↑</div>
          <div>
            <div className="stat-label">Total Income</div>
            <div className="stat-value">₹{summary.income?.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="stat-card card expense-card">
          <div className="stat-icon">↓</div>
          <div>
            <div className="stat-label">Total Expense</div>
            <div className="stat-value">₹{summary.expense?.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="stat-card card balance-card">
          <div className="stat-icon">₹</div>
          <div>
            <div className="stat-label">Net Balance</div>
            <div className={`stat-value ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
              ₹{summary.balance?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        <div className="stat-card card savings-card">
          <div className="stat-icon">%</div>
          <div>
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value positive">
              {summary.income > 0 ? Math.round((summary.balance / summary.income) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      <AddTransaction onAdded={fetchAll} />
      <BudgetGoals spentByCategory={catData} />

      <div className="charts-grid">
        <div className="chart-card card">
          <h3 className="chart-title">Category wise Expenses</h3>
          <CategoryPieChart data={catData} />
        </div>
        <div className="chart-card card">
          <h3 className="chart-title">Last 6 Months Overview</h3>
          <MonthlyBarChart data={monthlyData} />
        </div>
      </div>

      <div>
        <h2 className="section-title">Recent Transactions</h2>
        <TransactionList transactions={transactions} onRefresh={fetchAll} loading={txnLoading} />
      </div>
    </div>
  )
}
