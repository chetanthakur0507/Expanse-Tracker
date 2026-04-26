import { useState } from 'react'
import { deleteTransaction, updateTransaction } from '../utils/api'
import './TransactionList.css'

const CAT_EMOJI = {
  Food: '🍕', Travel: '✈️', Shopping: '🛍️', Bills: '📋',
  Salary: '💼', Entertainment: '🎬', Health: '🏥',
  Education: '📚', Investment: '📈', Other: '📦'
}

const CAT_COLORS = {
  Food: '#f59e0b', Travel: '#06b6d4', Shopping: '#8b5cf6',
  Bills: '#f97316', Salary: '#10b981', Entertainment: '#ec4899',
  Health: '#ef4444', Education: '#3b82f6', Investment: '#6366f1', Other: '#94a3b8'
}

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Entertainment', 'Health', 'Education', 'Investment', 'Other']

export default function TransactionList({ transactions, onRefresh, loading }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [filterTag, setFilterTag] = useState('')
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    const matchCat = filterCat === 'all' || t.category === filterCat
    const matchTag = !filterTag || (t.tags || []).some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
    return matchSearch && matchType && matchCat && matchTag
  })

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna chahte ho?')) return
    try {
      await deleteTransaction(id)
      onRefresh()
    } catch {}
  }

  const handleEditSave = async (id) => {
    try {
      await updateTransaction(id, editData)
      setEditId(null)
      onRefresh()
    } catch {}
  }

  const startEdit = (t) => {
    setEditId(t._id)
    setEditData({ description: t.description, amount: t.amount, category: t.category, type: t.type, date: t.date?.split('T')[0] })
  }

  return (
    <div className="txn-list-wrap">
      <div className="txn-filters card">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-chips">
          {['all', 'income', 'expense'].map(t => (
            <button
              key={t}
              className={`chip ${filterType === t ? 'chip-active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'All' : t === 'income' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>
        <select
          className="form-input"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ maxWidth: '160px', padding: '7px 10px', fontSize: '13px' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
        </select>
        <input
          className="form-input"
          placeholder="Filter tag"
          value={filterTag}
          onChange={e => setFilterTag(e.target.value)}
          style={{ maxWidth: '150px', padding: '7px 10px', fontSize: '13px' }}
        />
      </div>

      {loading ? (
        <div className="txn-empty">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="txn-empty">Koi transaction nahi mila 🤷</div>
      ) : (
        <div className="txn-table card">
          <div className="txn-count">{filtered.length} transactions</div>
          {filtered.map(t => (
            <div key={t._id} className="txn-row">
              {editId === t._id ? (
                <div className="txn-edit-row">
                  <input className="form-input" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} style={{ flex: 2 }} />
                  <input type="number" className="form-input" value={editData.amount} onChange={e => setEditData({ ...editData, amount: e.target.value })} style={{ flex: 1 }} />
                  <select className="form-input" value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} style={{ flex: 1 }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={() => handleEditSave(t._id)} style={{ padding: '8px 14px', fontSize: '13px' }}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditId(null)} style={{ padding: '8px 14px', fontSize: '13px' }}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className="txn-icon" style={{ background: CAT_COLORS[t.category] + '22' }}>
                    {CAT_EMOJI[t.category] || '📦'}
                  </div>
                  <div className="txn-info">
                    <div className="txn-name">{t.description}</div>
                    <div className="txn-meta">
                      <span className="txn-cat" style={{ color: CAT_COLORS[t.category] }}>{t.category}</span>
                      <span>•</span>
                      <span>{new Date(t.date).toLocaleDateString('en-IN')}</span>
                      {t.note && <><span>•</span><span className="txn-note">{t.note}</span></>}
                      {t.isRecurring && <><span>•</span><span className="txn-note">Recurring template</span></>}
                    </div>
                    {(t.tags || []).length > 0 && (
                      <div className="tag-row">
                        {t.tags.map(tag => (
                          <span key={`${t._id}-${tag}`} className="tag-pill">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                    {t.type}
                  </span>
                  <div className={`txn-amount ${t.type === 'income' ? 'amt-income' : 'amt-expense'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="txn-actions">
                    {t.receiptDataUrl && (
                      <button
                        className="action-btn"
                        onClick={() => window.open(t.receiptDataUrl, '_blank')}
                        title="View receipt"
                      >
                        📷
                      </button>
                    )}
                    <button className="action-btn" onClick={() => startEdit(t)} title="Edit">✏️</button>
                    <button className="action-btn danger" onClick={() => handleDelete(t._id)} title="Delete">🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
