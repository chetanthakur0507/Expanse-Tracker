import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSummary, getTransactions, syncRecurringTransactions } from '../utils/api'
import AddTransaction from '../components/AddTransaction'
import TransactionList from '../components/TransactionList'
import './Dashboard.css'

const CURRENT_YEAR = new Date().getFullYear()

export default function Transactions() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [month, setMonth] = useState('all')
  const [year, setYear] = useState('all')

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = {}
      if (month !== 'all') params.month = month
      if (year !== 'all') params.year = year

      await syncRecurringTransactions()

      const [summaryRes, txnRes] = await Promise.all([
        getSummary(params),
        getTransactions({ ...params, limit: 200 }),
      ])

      setSummary(summaryRes.data)
      setTransactions(txnRes.data.transactions)
    } catch (err) {
      setError(err.response?.data?.message || 'Transactions load nahi ho paaye')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>Transactions</h1>
          <p className="dash-sub">Hello {user?.name?.split(' ')[0]}, yahan tumhare saare records milenge</p>
        </div>
        <div className="dash-actions">
          <select
            className="form-input month-filter"
            value={month}
            onChange={e => setMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
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
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '14px' }}>{error}</div>}

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

      <AddTransaction onAdded={loadData} />

      <h2 className="section-title">All Transactions</h2>
      <TransactionList transactions={transactions} onRefresh={loadData} loading={loading} />
    </div>
  )
}
