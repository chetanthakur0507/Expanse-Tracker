import { useMemo, useState } from 'react'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Entertainment', 'Health', 'Education', 'Investment', 'Other']
const STORAGE_KEY = 'financeBudgetGoals'

const readGoals = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export default function BudgetGoals({ spentByCategory = [] }) {
  const [goals, setGoals] = useState(readGoals)
  const [savedMsg, setSavedMsg] = useState('')

  const spentMap = useMemo(() => {
    const map = {}
    spentByCategory.forEach((item) => {
      map[item._id] = item.total || 0
    })
    return map
  }, [spentByCategory])

  const handleChange = (category, value) => {
    setGoals((prev) => ({ ...prev, [category]: value }))
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    setSavedMsg('Budget goals saved')
    setTimeout(() => setSavedMsg(''), 1200)
  }

  return (
    <div className="card" style={{ padding: '18px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h3 className="chart-title" style={{ marginBottom: 0 }}>Budget Goals</h3>
        <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }} onClick={handleSave}>Save Goals</button>
      </div>
      <p className="dash-sub" style={{ marginTop: '6px', marginBottom: '12px' }}>Category wise monthly budget set karo. Overspend par red warning milegi.</p>

      {savedMsg && <div className="helper-text success" style={{ marginBottom: '10px' }}>{savedMsg}</div>}

      <div className="add-grid">
        {CATEGORIES.map((category) => {
          const goal = Number(goals[category] || 0)
          const spent = Number(spentMap[category] || 0)
          const isOverspent = goal > 0 && spent > goal
          return (
            <div key={category} className="form-group">
              <label className="form-label">{category}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={goals[category] || ''}
                onChange={(e) => handleChange(category, e.target.value)}
                placeholder="Monthly budget"
              />
              <small className={`helper-text ${isOverspent ? 'danger' : ''}`}>
                Spent: ₹{spent.toLocaleString('en-IN')} {goal > 0 ? `/ Budget: ₹${goal.toLocaleString('en-IN')}` : ''}
              </small>
              {isOverspent && <small className="helper-text danger">Overspent by ₹{(spent - goal).toLocaleString('en-IN')}</small>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
