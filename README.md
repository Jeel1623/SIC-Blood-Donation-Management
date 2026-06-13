# Blood Donation Management System

A full-stack Blood Donation Management System built for the **SIC Hackathon 2026**. It features a dark-themed React dashboard, a FastAPI REST backend, and a Python data layer built with custom DSA implementations.

---

## Features

- **Donor Management** — Register, search, and track blood donors
- **Blood Inventory** — Monitor stock levels, expiry dates, and low-supply alerts
- **Emergency Requests** — Priority queue for urgent blood requests with one-click fulfillment
- **Donation History** — LIFO stack-based record keeping with donor lookup
- **Analytics Dashboard** — Charts for blood group distribution, monthly trends, and inventory status
- **Authentication** — Login / Sign Up system with session persistence
- **Real-time Overview** — Live stats: total donors, eligible count, units available, queue size

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Recharts, Lucide Icons |
| Backend API | FastAPI + Uvicorn |
| Data Layer | Python 3.10+ |
| Data Storage | CSV (donors), JSON (inventory, history) |
| Charts (legacy) | Matplotlib + Seaborn (Streamlit app only) |
| Testing | Pytest (58 tests) |

---

## Project Structure

```
Blood Donation Management/
│
├── api.py                  # FastAPI REST API
├── app.py                  # Legacy Streamlit UI (standalone)
├── start.bat               # Launch both servers on Windows
├── requirements.txt
│
├── frontend/               # React + Vite app
│   └── src/
│       ├── App.jsx
│       ├── auth.js         # Login/signup with localStorage
│       ├── api.js          # API client
│       ├── components/     # Sidebar, Card, Badge, StatCard, PageHeader
│       └── pages/          # Overview, Donors, DonorSearch, Inventory,
│                           # Emergency, History, Analytics, Login
│
├── models/
│   ├── donor.py
│   ├── blood_inventory.py
│   └── donation_record.py
│
├── data_structures/
│   ├── donor_hash_table.py   # O(1) lookup by blood group / city
│   ├── emergency_queue.py    # Min-heap priority queue
│   └── donation_stack.py     # LIFO donation history
│
├── services/
│   ├── donor_service.py
│   ├── inventory_service.py
│   ├── emergency_service.py
│   └── history_service.py
│
├── file_io/
│   ├── csv_handler.py        # Donor persistence
│   └── json_handler.py       # Inventory + history persistence
│
├── analytics/
│   └── dashboard.py          # Matplotlib/Seaborn charts (Streamlit only)
│
├── data/
│   ├── donors.csv            # 100 seed donors
│   ├── inventory.json
│   └── donations.json
│
└── tests/                    # 58 pytest tests
```

---

## Data Structures Used

| Structure | Implementation | Use Case |
|---|---|---|
| **Hash Table** | `DonorHashTable` — three dicts keyed by `id`, `blood_group`, `city` | O(1) donor lookup |
| **Priority Queue** | `EmergencyQueue` — min-heap via `heapq` | Process critical requests first |
| **Stack** | `DonationStack` — LIFO list | Most-recent donation retrieval |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

### 1. Clone the repository

```bash
git clone https://github.com/Rahul-KrishnaA/SIC-Blood-Donation-Management.git
cd SIC-Blood-Donation-Management
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Running the App

### Option A — One-click (Windows)

Double-click **`start.bat`** — opens two terminal windows, one for the backend and one for the frontend.

### Option B — Manual

**Terminal 1 — Backend:**
```bash
python -m uvicorn api:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Option C — Legacy Streamlit UI

```bash
python -m streamlit run app.py
```

---

## Default Login Credentials

| Username | Password |
|---|---|
| Rahul | 123 |
| Jeel | 123 |

You can also create a new account from the Sign Up tab on the login page.

---

## API Endpoints

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/overview` | Dashboard stats, charts data, recent donations |
| GET | `/api/donors` | List all donors |
| POST | `/api/donors` | Register a new donor |
| GET | `/api/donors/search` | Search by blood group, city, or eligibility |
| GET | `/api/inventory` | List all blood inventory |
| POST | `/api/inventory` | Add blood units |
| GET | `/api/emergency` | Pending emergency queue |
| POST | `/api/emergency` | Submit emergency request |
| POST | `/api/emergency/process` | Process next request in queue |
| GET | `/api/history` | Recent donation records |
| GET | `/api/history/{donor_id}` | Donation history for a specific donor |
| POST | `/api/history` | Record a donation |

Interactive API docs available at **http://localhost:8000/docs**

---

## Running Tests

```bash
pytest tests/ -v
```

58 tests covering models, data structures, file I/O, and services.

---

## Seed Data

The repository includes pre-loaded data:

- **100 donors** — realistic Indian names across 10+ cities, all 8 blood groups
- **Inventory** — 8 blood groups with units and expiry dates
- **96 donation records** — spread across 2024–2026

---

## Blood Group Eligibility

Donors are eligible to donate if their last donation was **90+ days ago** (or if they have never donated). The system automatically calculates this and flags eligible donors in search results.

---

## Built With

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Recharts](https://recharts.org/)
- [Lucide React](https://lucide.dev/)
- [Streamlit](https://streamlit.io/) (legacy UI)


