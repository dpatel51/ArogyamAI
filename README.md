<p align="center">
  <img src="https://img.shields.io/badge/Status-Hackathon%20Submission-brightgreen" alt="Status">
  <img src="https://img.shields.io/badge/AI-Multi%20Agent%20System-blue" alt="AI">
  <img src="https://img.shields.io/badge/MCP-Model%20Context%20Protocol-purple" alt="MCP">
  <img src="https://img.shields.io/badge/Built%20With-Google%20ADK-orange" alt="Google ADK">
</p>

# 🏥 आरोग्यमAI (ArogyamAI)

### **Predict. Prepare. Prevent. — Powered by Multi-Agent AI**

> An Agentic AI-driven Predictive Hospital Management System that forecasts patient surges during festivals, pollution spikes, and epidemics using real-time data. It proactively recommends optimal staffing, medical supply adjustments, and patient advisories — helping hospitals prepare in advance.

---

## 🎯 The Problem

Hospitals across India face **sudden, unpredictable surges** in patient inflow during:

| Crisis Type                     | Impact                                   |
| ------------------------------- | ---------------------------------------- |
| 🎆 **Festivals** (Diwali, Holi) | Burns, respiratory issues, accidents     |
| 🌫️ **Pollution Peaks**          | AQI > 300 causes 140%+ respiratory surge |
| 🦠 **Epidemics**                | Dengue, Malaria during monsoons          |
| 🚨 **Emergencies**              | Stampedes, accidents, natural disasters  |

### Real Consequences:

- 😰 **Supply shortages** — oxygen cylinders run out mid-crisis
- 😓 **Staff burnout** — 72-hour shifts during unexpected rushes
- 🏨 **Overcrowded wards** — patients waiting hours for basic care
- ⏰ **Zero preparation time** — because no one saw it coming

---

## 💡 Our Solution

A **Multi-Agent AI System** that acts as your hospital's crystal ball — predicting surges 7-14 days in advance and automating resource preparation.

### What We Do:

| Feature                           | Description                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| 🔮 **Predicts the Unpredictable** | Analyzes AQI, festivals, pharmacy sales, social media & 50+ data sources             |
| 🤖 **Plans Automatically**        | AI agents calculate exactly how many doctors, nurses, O2 cylinders & ICU beds needed |
| 🧠 **Explains Its Thinking**      | "AQI crossed 300 + Diwali in 5 days → Expect 40% increase in respiratory cases"      |
| 🛒 **Orders Before You Run Out**  | Procurement agent drafts POs automatically — approve with one click                  |

---

## 🏗️ System Architecture

### High-Level Architecture

![Architecture Diagram](https://assets.devfolio.co/content/f1159a57a0f94c2a8d757e5772a4d9a8/9b5f586e-5254-496e-bd1f-732407159cda.jpeg)

### Multi-Agent Flow

![Multi-Agent Integration](https://assets.devfolio.co/content/f1159a57a0f94c2a8d757e5772a4d9a8/614b50fd-437a-4736-881d-c248bd084b99.jpeg)

---

## 🤖 Multi-Agent System

Our system leverages **Google ADK (Agent Development Kit)** with **Model Context Protocol (MCP)** for seamless tool integration.

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROOT AGENT (Coordinator)                      │
│              hospital_admin_coordinator                          │
│         Orchestrates all sub-agents & user interactions          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐     ┌───────────────────────┐
│  PREDICTIVE AGENT │     │   PROCUREMENT AGENT   │
│                   │     │                       │
│ • Historical Data │     │ • Inventory Management│
│ • Surge Forecast  │     │ • Purchase Orders     │
│ • Risk Assessment │     │ • Supplier Management │
└─────────┬─────────┘     └───────────┬───────────┘
          │                           │
          │         MCP SERVERS       │
          │    ┌─────────────────┐    │
          └───►│ Resource MCP    │◄───┘
               │ Procurement MCP │
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │  Hospital API   │
               │   (Express.js)  │
               └─────────────────┘
```

### 🎯 Agent Roles

| Agent                 | Model            | Responsibility                                |
| --------------------- | ---------------- | --------------------------------------------- |
| **Root Coordinator**  | Gemini 2.0 Flash | Orchestrates sub-agents, handles user queries |
| **Predictive Agent**  | Gemini 2.0 Flash | Analyzes historical data, predicts surges     |
| **Procurement Agent** | Gemini 2.0 Flash | Manages inventory, creates purchase orders    |

### 🔧 MCP (Model Context Protocol) Servers

We use MCP to give AI agents secure, structured access to hospital systems:

#### Resource MCP Server

```typescript
Tools Available:
├── get_staffing()      → Staff allocation by department/shift
├── get_inventory()     → Medical supplies, equipment status
└── get_bed_capacity()  → Ward occupancy, ICU availability
```

#### Procurement MCP Server

```typescript
Tools Available:
├── list_purchase_orders()     → View all POs with filters
├── create_purchase_order()    → Generate new orders
├── update_order_status()      → Approve/reject/deliver
└── get_supplier_info()        → Supplier availability & lead times
```

---

## 📊 Data Sources & Predictive Intelligence

### Real-Time Data Streams

| Source                       | Data Type                           | Use Case                      |
| ---------------------------- | ----------------------------------- | ----------------------------- |
| 🌫️ **Environmental APIs**    | AQI, Temperature, Humidity          | Respiratory surge prediction  |
| 📅 **Calendar Intelligence** | Festivals, Holidays, Events         | Event-based surge forecasting |
| 🦠 **Epidemic Surveillance** | WHO alerts, Health bulletins        | Disease outbreak detection    |
| 💊 **Pharmacy Signals**      | OTC medicine sales                  | Early warning indicators      |
| 🚗 **Traffic Analytics**     | Crowd patterns, accidents           | Accident surge prediction     |
| 📱 **Social Media**          | Symptom mentions, health complaints | Community health signals      |
| 🏥 **Historical Records**    | Past admission patterns             | Baseline & seasonal trends    |

### Predictive Models

Our ML pipeline includes:

- **Time-Series Forecasting** — Predict patient volumes 7-14 days ahead
- **Multi-Source Risk Assessment** — Combine environmental, social, and historical data
- **Anomaly Detection** — Spot unusual patterns that deviate from trends
- **Explainable AI** — Every prediction comes with human-readable reasoning

---

## 📈 Historical Surge Analysis

Our system is trained on comprehensive historical data covering all 12 months:

### Critical Alert Months (Surge > 1000 patients)

| Month            | Festival         | Primary Surge       | Patient Count | Key Cause                 |
| ---------------- | ---------------- | ------------------- | ------------- | ------------------------- |
| 🧨 **November**  | Diwali           | Respiratory + Burns | **1,940**     | AQI 380+, Firecrackers    |
| 🎨 **March**     | Holi             | Skin + Respiratory  | **1,075**     | Chemical colors, Bonfires |
| 🦠 **September** | Ganesh Chaturthi | Infectious          | **1,110**     | Dengue peak, Waterborne   |
| ❄️ **December**  | Christmas/NYE    | Respiratory         | **1,235**     | Winter smog, Accidents    |

### Surge Prediction Example

```
INPUT:  "Prepare for Diwali surge"

PREDICTIVE AGENT OUTPUT:
├── Historical Pattern: November averages 1,940 patients (320% above baseline)
├── Disease Breakdown:
│   ├── Respiratory: 1,050 cases (AQI correlation: 95%)
│   ├── Burns/Accidents: 485 cases
│   ├── Gastrointestinal: 240 cases
│   └── Cardiac: 165 cases
├── Resource Needs:
│   ├── Oxygen Cylinders: 420/day × 15 days = 6,300 (+20% buffer = 7,560)
│   ├── ICU Beds: 145 admissions expected
│   └── Ventilators: 45-50 required
└── Critical Period: Nov 10-25

PROCUREMENT AGENT ACTION:
├── Current Stock: 280 oxygen cylinders
├── Deficit: 7,280 cylinders
├── Generated: PO-2024-001 for 7,500 cylinders
└── Status: PENDING_APPROVAL (awaiting admin)
```

---

## 🖥️ Tech Stack

### Backend

| Technology             | Purpose                |
| ---------------------- | ---------------------- |
| **Node.js + Express**  | REST API Server        |
| **MongoDB + Mongoose** | Database               |
| **Google ADK**         | Agent Development Kit  |
| **MCP SDK**            | Model Context Protocol |

### Frontend

| Technology       | Purpose            |
| ---------------- | ------------------ |
| **React 18**     | UI Framework       |
| **Recharts**     | Data Visualization |
| **Axios**        | API Communication  |
| **Lucide React** | Icons              |

### AI/ML

| Technology           | Purpose                   |
| -------------------- | ------------------------- |
| **Gemini 2.0 Flash** | LLM for Agents            |
| **Google ADK**       | Multi-Agent Orchestration |
| **MCP**              | Tool Integration Protocol |

---

## 📁 Project Structure

```
ArogyamAI/
├── 🔧 backend/                    # Express.js API Server
│   ├── server.js                  # Main server entry
│   ├── db.js                      # MongoDB connection
│   ├── models/                    # Mongoose schemas
│   │   ├── BedCapacity.js
│   │   ├── Inventory.js
│   │   ├── PurchaseOrder.js
│   │   ├── Staffing.js
│   │   └── Supplier.js
│   └── routes/                    # API routes
│       ├── ai-agent.js            # ADK Agent proxy
│       ├── procurement.js         # Purchase order APIs
│       └── resources.js           # Hospital resource APIs
│
├── 🎨 frontend/                   # React Dashboard
│   └── src/
│       ├── components/
│       │   ├── AIChat.js          # AI Assistant Interface
│       │   └── Header.js
│       ├── pages/
│       │   ├── SurgePredictionDashboard.js
│       │   ├── InventoryTab.js
│       │   ├── StaffingTab.js
│       │   ├── BedCapacityTab.js
│       │   └── OrdersTab.js
│       └── services/
│           └── api.js             # API client
│
├── 🤖 Multi-Agent/                # Google ADK Agents
│   └── multi_tool_agent/
│       ├── agent.py               # Agent definitions
│       └── __init__.py
│
├── 🔌 procurement-mcp/            # Procurement MCP Server
│   └── src/
│       ├── index.ts               # MCP server implementation
│       └── types.ts
│
└── 🔌 resource-mcp/               # Resource MCP Server
    └── src/
        ├── index.ts               # MCP server implementation
        └── types.ts
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB
- Google Cloud account (for Gemini API)

### 1️⃣ Start Backend

```bash
cd backend
npm install
npm start
```

### 2️⃣ Start MCP Servers

```bash
# Terminal 1 - Resource MCP
cd resource-mcp && npm install && npm run build

# Terminal 2 - Procurement MCP
cd procurement-mcp && npm install && npm run build
```

### 3️⃣ Start Multi-Agent System

```bash
cd Multi-Agent
pip install google-adk
adk run multi_tool_agent
```

### 4️⃣ Start Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🎯 Target Audience

### Primary Users

| Segment                      | Details                                               |
| ---------------------------- | ----------------------------------------------------- |
| 🏥 **Large Hospital Chains** | 200-1000 bed hospitals                                |
| 🌆 **Metro City Hospitals**  | Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata |
| 🏛️ **Government Hospitals**  | Public health facilities                              |

### Secondary Beneficiaries

- Public Health Agencies
- Insurance Companies
- Health Policy Makers

---

## 💰 Business Model

### Go-To-Market Strategy

**Phase 1: Pilot**

- Partner with 2-3 large hospitals in metro cities
- Validate predictive accuracy during high-demand seasons
- Integrate with existing HIS/EMR systems

**Phase 2: Scale**

- Case studies & testimonials from pilot hospitals
- Healthcare conferences and medical association partnerships

### Revenue Streams

| Model                    | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| 💳 **SaaS Subscription** | Tiered pricing based on hospital size (beds, departments)  |
| 📊 **Data-as-a-Service** | Aggregated, anonymized insights for insurers & researchers |

---

## 🏆 Key Differentiators

| Feature               | Traditional Systems | ArogyamAI                |
| --------------------- | ------------------- | ------------------------ |
| **Prediction Window** | Reactive            | 7-14 days advance        |
| **Data Sources**      | Single              | 50+ integrated sources   |
| **Automation**        | Manual              | AI-driven procurement    |
| **Explainability**    | Black box           | Crystal-clear reasoning  |
| **Scalability**       | Limited             | Multi-agent architecture |

---

## 👥 Team

Built with ❤️ for **MumbaiHacks Hackathon** by Dilip, Shubham, Rhutik & Shraddha!

---

## 📄 License

This project is submitted as part of a hackathon. All rights reserved.

---

<p align="center">
  <b>🏥 आरोग्यमAI — Because every minute counts in a healthcare emergency</b>
</p>
