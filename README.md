# 💰 Finance Tracker (MERN Stack)

A full-stack **Finance Tracker Web App** built using the MERN stack that helps users manage income and expenses, track budgets, and visualize financial data.

---

## 🚀 Features

### 🔐 Authentication System
Secure user authentication using JWT.
- User can register and login  
- Protected routes for authorized access  
- Passwords are securely hashed using bcrypt  

---

### 💸 Income & Expense Tracking
Easily manage your finances.
- Add income and expense transactions  
- Edit or delete transactions anytime  
- Real-time balance updates automatically  

---

### 📊 Smart Analytics Dashboard
Visualize your financial data.
- Category-wise **Pie Chart**  
- Last 6 months **Bar Chart**  
- Summary reports for income vs expense  

---

### 🗂 Categories System
Predefined categories for better organization:
- Food, Travel, Shopping, Bills, Salary  
- Entertainment, Health, Education  
- Investment, Other  

---

### 🎯 Budget Goals
Control your spending effectively.
- Set monthly budgets per category  
- Get alerts when budget exceeds  

---

### 🔁 Recurring Transactions
Automate regular expenses and income.
- Weekly / Monthly / Yearly transactions  
- Useful for rent, EMI, salary, etc.  

---

### 🏷 Tags & Labels
Better filtering and organization.
- Add custom tags (e.g., vacation, office, home)  
- Easily filter transactions using tags  

---

### 🔍 Search & Filter
Find transactions quickly.
- Filter by category, type, tags  
- Search by description  
- Filter by date range  

---

### 🎤 Voice Input
Add transactions using your voice.
- Uses Web Speech API  
- Faster data entry experience  

---

### 🌙 Dark Mode
Switch between light and dark themes for better UI experience.

---

### 📄 PDF Export
Download your financial reports.
- Export all transactions  
- Clean and structured PDF format  

---

### 📱 Responsive Design
Fully optimized for:
- Mobile 📱  
- Tablet 💻  
- Desktop 🖥  

---

## 🛠 Tech Stack

### Frontend
- React (Vite)  
- Axios  
- Recharts  
- jsPDF  

### Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  

---

## ⚙️ How to Run Project

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker

cd frontend
npm install
npm run dev

cd backend
npm install
npm run dev

### Create .env file inside backend:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000


http://localhost:5173


### Project Structure

finance-tracker/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── context/
        └── utils/


🧑‍💻 Author

Chetan Thakur
MERN Stack Developer 🚀
