# Heavy Metal Pollution Index (HPI) & Evaluation Index (HEI) Assessment Platform

A full-stack, responsive web application for assessing heavy metal pollution in water samples, performing automated scientific calculations, comparing measurements with authoritative WHO and BIS drinking water standards, rendering spatial contamination maps, and generating certified environmental reports.

---

## 1. System Overview & Architecture

The application provides a computational and visualization framework for environmental scientists, hydrologists, and municipal water authorities.

```
heavy-metal-pollution-app/
├── client/                     # Frontend (React 19, Vite, Recharts, Leaflet, Lucide)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Sidebar, Navbar, MetricCard, Banner, etc.)
│   │   ├── context/            # AuthContext (JWT session state & role permissions)
│   │   ├── layouts/            # AppLayout (Responsive drawer navigation & shell)
│   │   ├── pages/              # 16 complete views including Landing, Dashboard, Maps, Reports
│   │   ├── services/           # Axios API service client
│   │   ├── styles/             # Scientific design tokens (Navy, Teal, Emerald, Amber, Crimson)
│   │   └── utils/              # Formatting helpers and HPI/HEI classification badges
│   ├── index.html              # SEO optimized HTML with Leaflet styling
│   ├── package.json
│   └── .env.example
├── server/                     # Backend REST API (Node.js, Express, Mongoose, JWT, Bcrypt)
│   ├── src/
│   │   ├── config/             # Robust MongoDB connection with health check status
│   │   ├── controllers/        # Auth, Sample, Assessment, Standard, Dashboard, Report, Audit
│   │   ├── middleware/         # JWT verification, Role authorization, Rate limiters, Error handler
│   │   ├── models/             # User, WaterSample, ReferenceStandard, PollutionAssessment, AuditLog
│   │   ├── routes/             # Express API router definitions
│   │   ├── services/           # HPI and HEI mathematical calculation engine & unit normalizer
│   │   ├── validators/         # Input validation & sanitization via express-validator
│   │   ├── app.js              # Express application assembly
│   │   └── server.js           # Server startup (strictly connects to MongoDB before HTTP listen)
│   ├── scripts/
│   │   └── seed.js             # Seed script for demo accounts, standards, and labeled test samples
│   ├── tests/
│   │   ├── calculation.test.js # Precision unit tests for HPI & HEI math formulas
│   │   └── api.test.js         # Supertest integration tests for all REST endpoints
│   ├── package.json
│   └── .env.example
├── package.json                # Root package with unified developer scripts
├── README.md                   # Full system documentation
└── .gitignore
```

---

## 2. Mathematical Formulations & Scientific Methodology

### 2.1 Heavy Metal Pollution Index (HPI)
**Citations:**  
- *Prasad, B., & Bose, J. M. (2001).* "Evaluation of the heavy metal pollution index for ground water of an abandoned open cast coal mine." *Environment International*, 27(6), 463-467.  
- *Mohan, S. V., Nithila, P., & Reddy, S. J. (1996).* "Estimation of heavy metal in drinking water and development of heavy metal pollution index." *Journal of Environmental Science & Health Part A*.

$$\text{HPI} = \frac{\sum_{i=1}^{n} (W_i \times Q_i)}{\sum_{i=1}^{n} W_i}$$

Where:
- **$W_i$ (Unit Weight):** Inversely proportional to standard permissible value $S_i$:
  $$W_i = \frac{k}{S_i} \quad \text{where} \quad k = \frac{1}{\sum_{i=1}^{n} \left(\frac{1}{S_i}\right)}$$
  *(This ensures $\sum W_i = 1$, giving higher weighting factors to metals with stricter permissible limits like Pb, Cd, As).*
- **$Q_i$ (Sub-index Rating):**
  $$Q_i = \frac{|M_i - I_i|}{S_i - I_i} \times 100$$
  - $M_i$: Measured heavy metal concentration ($\text{mg/L}$).
  - $I_i$: Ideal concentration value ($0.0\ \text{mg/L}$ for toxic heavy metals as per WHO guidelines).
  - $S_i$: Standard permissible limit ($\text{mg/L}$).
  - Thus: $Q_i = \left(\frac{M_i}{S_i}\right) \times 100$.

#### HPI Classification Thresholds:
| HPI Value | Classification Category | Screening Decision | Water Quality Implication |
| :--- | :--- | :--- | :--- |
| **$< 50$** | **Low Pollution** | Within selected threshold | Good water quality, safe for consumption |
| **$50 - 100$** | **Medium / Threshold Pollution** | Requires review | Moderate pollution, continuous monitoring needed |
| **$> 100$** | **High Pollution** | Exceeds selected threshold | Unsuitable for consumption without treatment |

---

### 2.2 Heavy Metal Evaluation Index (HEI)
**Citation:**  
- *Edet, A. E., & Offiong, O. E. (2002).* "Evaluation of water quality index of drinking water in Calabar Municipality, Nigeria." *Environmental Geology*, 42(5), 452-460.

$$\text{HEI} = \sum_{i=1}^{n} \frac{C_i}{\text{MAC}_i}$$

Where:
- $C_i$: Measured concentration of metal $i$ ($\text{mg/L}$).
- $\text{MAC}_i$: Maximum Allowable Concentration under selected standard ($\text{mg/L}$).

#### HEI Classification Thresholds:
| HEI Value | Classification Category | Screening Decision |
| :--- | :--- | :--- |
| **$< 10$** | **Low Heavy Metal Pollution** | Within selected threshold |
| **$10 - 20$** | **Medium Heavy Metal Pollution** | Requires review |
| **$> 20$** | **High Heavy Metal Pollution** | Exceeds selected threshold |

---

## 3. Reference Standards Implemented

The application includes verified, versioned limits in $\text{mg/L}$:

| Metal Chemical Symbol | Element Name | WHO (4th Edition) Limit | BIS (IS 10500:2012) Limit | Primary Health Risk / Target Organ |
| :--- | :--- | :--- | :--- | :--- |
| **Pb** | Lead | $0.01\ \text{mg/L}\ (10\ \mu\text{g/L})$ | $0.01\ \text{mg/L}$ | Neurotoxicity & developmental impairment |
| **Cd** | Cadmium | $0.003\ \text{mg/L}\ (3\ \mu\text{g/L})$ | $0.003\ \text{mg/L}$ | Renal dysfunction & lifetime bioaccumulation |
| **Cr** | Chromium | $0.05\ \text{mg/L}\ (50\ \mu\text{g/L})$ | $0.05\ \text{mg/L}$ | Total chromium carcinogenic concern |
| **Cu** | Copper | $2.0\ \text{mg/L}$ | $0.05\ \text{mg/L}$ | Acute gastrointestinal distress & liver toxicity |
| **Zn** | Zinc | $3.0\ \text{mg/L}$ | $5.0\ \text{mg/L}$ | Aesthetic deterioration and metallic taste |
| **Ni** | Nickel | $0.07\ \text{mg/L}\ (70\ \mu\text{g/L})$ | $0.02\ \text{mg/L}$ | Contact dermatitis and cellular damage |
| **Fe** | Iron | $0.3\ \text{mg/L}$ | $0.3\ \text{mg/L}$ | Taste threshold, turbidity, and pipe staining |
| **As** | Arsenic | $0.01\ \text{mg/L}\ (10\ \mu\text{g/L})$ | $0.01\ \text{mg/L}$ | Skin lesions, circulatory issues, carcinogen |
| **Hg** | Mercury | $0.006\ \text{mg/L}\ (6\ \mu\text{g/L})$ | $0.001\ \text{mg/L}$ | Neurological disorder and kidney damage |

*Note: Standards maintain strict historical immutability. When an assessment is generated, the exact standard snapshots are bound to the calculation record.*

---

## 4. Quick Start & Local Setup

### 4.1 Prerequisites
- **Node.js**: v18.0+ or v22.0+
- **MongoDB**: MongoDB Atlas cluster OR local MongoDB instance (`mongodb://127.0.0.1:27017`)

### 4.2 Installation
In the project root folder:
```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install
```

### 4.3 Configure Environment Variables
In `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/heavy_metal_db
JWT_SECRET=super_secret_heavy_metal_assessment_token_2026_xyz987
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

In `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4.4 Seed Database with Initial Data
Initialize default users, official standards, and realistic labeled demonstration samples:
```bash
cd server
npm run seed
```

### 4.5 Start Backend & Frontend
Terminal 1 (Backend API):
```bash
cd server
npm run dev
# Running on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

Terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 5. MongoDB Atlas Cloud Database Setup Instructions

To connect to cloud-hosted MongoDB Atlas:

1. **Sign Up / Sign In**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and log in.
2. **Create a Cluster**:
   - Choose the **M0 Free Shared Tier**.
   - Select your preferred cloud provider and closest region (e.g., AWS / Mumbai, Frankfurt, or N. Virginia).
3. **Configure Database Access (User Credentials)**:
   - Navigate to **Security > Database Access**.
   - Click **Add New Database User**.
   - Choose **Password** authentication.
   - Enter a username (e.g., `aquaindex_admin`) and a secure password.
   - Assign user privileges: **Read and write to any database**.
4. **Configure Network Access (IP Whitelist)**:
   - Navigate to **Security > Network Access**.
   - Click **Add IP Address**.
   - For cloud development / deployment, click **Allow Access from Anywhere** (`0.0.0.0/0`) or add your specific IP address.
5. **Obtain Connection String**:
   - Navigate to **Databases > Clusters**, click **Connect**.
   - Select **Drivers (Node.js)**.
   - Copy the SRV URI string. It looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/heavy_metal_db?retryWrites=true&w=majority
     ```
6. **Update `.env`**:
   - Paste the connection string into `server/.env` as `MONGODB_URI`, replacing `<username>` and `<password>`.
   - Run `npm run seed` to populate your Atlas cluster!

---

## 6. Pre-Configured Demo Accounts

For fast inspection of different role permissions, you can use the 1-click autofill buttons on the login page or enter:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@environmental.org` | `Admin@12345` | Full system control, reference standards creation/editing, audit log reviews |
| **Analyst** | `analyst@environmental.org` | `Analyst@12345` | Water sample registration, edit/delete own samples, run HPI & HEI calculations |
| **Viewer** | `viewer@environmental.org` | `Viewer@12345` | Read-only access to samples, charts, map hotspots, and PDF/CSV report exports |

---

## 7. Automated Testing Suite

The application includes mathematical verification tests and integration tests. Run them using:

```bash
cd server
npm test
```

### Actual Test Results
```
PASS tests/api.test.js
  Heavy Metal Pollution API Integration Suite
    √ GET /api/health should return HEALTHY and connected database status
    √ POST /api/auth/login should authenticate analyst and return JWT token
    √ POST /api/auth/login should authenticate admin and return JWT token
    √ GET /api/auth/me should return current user details with valid token
    √ GET /api/auth/me should reject request without token (401)
    √ GET /api/samples should retrieve paginated water samples list
    √ POST /api/samples should create new sample with validation and unit conversion
    √ GET /api/standards should list official WHO and BIS standards
    √ GET /api/dashboard/summary should return computed environmental metrics
    √ GET /api/dashboard/trends should return timeline data and metal averages
    √ POST /api/standards should restrict standard creation to admin (403 for analyst)

PASS tests/calculation.test.js
  Heavy Metal Pollution Calculation Engine
    Unit Conversions and Validation
      √ correctly normalizes standard units to mg/L
      √ rejects negative concentration values
      √ rejects non-numeric values and null/undefined
      √ rejects unsupported units
    HPI Calculation Engine (Prasad & Bose 2001 formulation)
      √ calculates exact verified manual HPI test case
      √ correctly flags High Pollution when concentrations exceed critical limits
      √ correctly handles missing reference standards gracefully
      √ throws error if no measurements match reference standards
    HEI Calculation Engine (Edet & Offiong 2002 formulation)
      √ calculates exact verified manual HEI test case
      √ classifies High Heavy Metal Pollution when HEI > 20
    performFullAssessment
      √ produces comprehensive combined assessment and standard snapshot

Test Suites: 2 passed, 2 total
Tests:       22 passed, 22 total
```

---

## 8. Responsible-Use & Environmental Screening Disclaimer

> **IMPORTANT SCIENTIFIC NOTICE:**  
> The Heavy Metal Pollution Index (HPI) and Heavy Metal Evaluation Index (HEI) implemented in this software are numerical screening and environmental surveillance tools. They aggregate laboratory measurements to prioritize water sources requiring regulatory attention. They are not substitutes for clinical toxicology assessments or certified municipal laboratory validation.  
> The application analyzes user-supplied laboratory measurements; it does not claim direct sensor hardware measurement of heavy metals. In accordance with environmental monitoring standards, demonstration samples are visibly marked as synthetic demo data.

---

## 9. License

This project is licensed under the MIT License — open-source for scientific research and environmental protection.
