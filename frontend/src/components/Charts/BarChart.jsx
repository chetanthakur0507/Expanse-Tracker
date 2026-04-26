import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MonthlyBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>Data nahi mila</div>
  }

  // Transform aggregation data to chart format
  const chartMap = {}
  data.forEach(d => {
    const key = `${d._id.year}-${d._id.month}`
    if (!chartMap[key]) {
      chartMap[key] = {
        name: MONTHS[d._id.month - 1],
        income: 0,
        expense: 0,
        sort: d._id.year * 100 + d._id.month
      }
    }
    chartMap[key][d._id.type] = d.total
  })

  const chartData = Object.values(chartMap).sort((a, b) => a.sort - b.sort)

  const fmt = (val) => `₹${(val / 1000).toFixed(0)}k`

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text3)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fill: 'var(--text3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name.charAt(0).toUpperCase() + name.slice(1)]}
          contentStyle={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: 'var(--text2)', fontSize: '12px' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>}
        />
        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
