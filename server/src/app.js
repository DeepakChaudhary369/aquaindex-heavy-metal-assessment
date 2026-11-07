const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { getDbStatus } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const sampleRoutes = require('./routes/sampleRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const standardRoutes = require('./routes/standardRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const { loadDataset } = require('./services/datasetService');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration restricted to client origins
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const isAllowedVercelOrigin = (origin) => {
  return /^https:\/\/aquaindex-heavy-metal-assessment.*\.vercel\.app$/.test(origin);
};
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || isAllowedVercelOrigin(origin) || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: This origin is not authorized by the server.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (skip during testing to keep test output clean)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const User = require('./models/User');
const WaterSample = require('./models/WaterSample');
const ReferenceStandard = require('./models/ReferenceStandard');
const PollutionAssessment = require('./models/PollutionAssessment');
const AuditLog = require('./models/AuditLog');

// Global API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = getDbStatus();
  const statusCode = dbStatus.isConnected ? 200 : 503;

  let counts = {
    samples: 0,
    assessments: 0,
    standards: 0,
    users: 0,
    auditLogs: 0,
  };

  if (dbStatus.isConnected) {
    try {
      const [samples, assessments, standards, users, auditLogs] = await Promise.all([
        WaterSample.countDocuments(),
        PollutionAssessment.countDocuments(),
        ReferenceStandard.countDocuments(),
        User.countDocuments(),
        AuditLog.countDocuments(),
      ]);
      counts = { samples, assessments, standards, users, auditLogs };
    } catch {
      // fallback in case of count issue during migration
    }
  }

  const mem = process.memoryUsage();
  let datasetCount = 0;
  try {
    const dataset = loadDataset();
    datasetCount = dataset.length;
  } catch {
    // fallback
  }

  res.status(statusCode).json({
    success: dbStatus.isConnected,
    status: dbStatus.isConnected ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memory: {
      rssMb: (mem.rss / 1024 / 1024).toFixed(1),
      heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(1),
      heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(1),
    },
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      dbName: dbStatus.dbName,
    },
    dataset: {
      status: datasetCount > 0 ? 'LOADED' : 'NOT_FOUND',
      recordsCount: datasetCount,
      path: process.env.DATASET_CSV_PATH || 'data/aquaindex_heavy_metals_synthetic_dataset.csv',
      isSynthetic: true,
      dataNotice: 'SYNTHETIC DEMONSTRATION DATASET: For workflow evaluation only.',
    },
    aiChatbot: {
      botName: 'AquaBot',
      configured: true,
      openAiKeyConfigured: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'),
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      localEngineFallback: true,
    },
    collections: counts,
    version: '1.0.0',
    system: 'AquaIndex Heavy Metal Pollution Index Assessment System (HPI & HEI)',
  });
});

// Root route: Backend Server Developer & Command Portal
app.get('/', async (req, res) => {
  const dbStatus = getDbStatus();
  let counts = { samples: 0, assessments: 0, standards: 0, users: 0, auditLogs: 0 };

  if (dbStatus.isConnected) {
    try {
      const [samples, assessments, standards, users, auditLogs] = await Promise.all([
        WaterSample.countDocuments(),
        PollutionAssessment.countDocuments(),
        ReferenceStandard.countDocuments(),
        User.countDocuments(),
        AuditLog.countDocuments(),
      ]);
      counts = { samples, assessments, standards, users, auditLogs };
    } catch {
      // fallback
    }
  }

  const mem = process.memoryUsage();
  const uptime = Math.floor(process.uptime());

  // If client wants JSON (API client / curl), return JSON metadata
  if (req.accepts('json') && !req.accepts('html')) {
    return res.status(200).json({
      service: 'AquaIndex Backend REST API Engine',
      port: 5000,
      status: 'ONLINE',
      database: dbStatus,
      collections: counts,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth/login',
        users: '/api/auth/users',
        samples: '/api/samples',
        assessments: '/api/assessments',
        standards: '/api/standards',
        dashboard: '/api/dashboard/summary',
        auditLogs: '/api/audit-logs',
      },
    });
  }

  // HTML Server Command & Developer Portal
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AquaIndex • Backend REST API Engine (Port 5000)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0f1d;
      --card: #121a2f;
      --border: rgba(148, 163, 184, 0.15);
      --primary: #06b6d4;
      --accent: #14b8a6;
      --text: #f8fafc;
      --muted: #94a3b8;
      --success: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.5;
      padding: 2rem 1.5rem;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    .header {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.35);
      margin-bottom: 0.75rem;
    }
    h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; margin-bottom: 0.4rem; }
    p.lead { color: var(--muted); font-size: 0.95rem; margin-bottom: 1.5rem; }
    .btn-group { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: linear-gradient(135deg, #06b6d4, #0891b2); color: #04121f; }
    .btn-secondary { background: rgba(148, 163, 184, 0.1); color: var(--text); border: 1px solid var(--border); }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .stat-label { font-size: 0.78rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
    .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 700; color: var(--primary); }
    .section-title { font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .table-container {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow-x: auto;
      margin-bottom: 2rem;
    }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th { padding: 0.85rem 1rem; background: rgba(255,255,255,0.02); color: var(--muted); border-bottom: 1px solid var(--border); }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(148, 163, 184, 0.08); }
    code { font-family: 'JetBrains Mono', monospace; color: var(--primary); background: rgba(6, 182, 212, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.8rem; }
    .method-get { color: #10b981; font-weight: 700; }
    .method-post { color: #06b6d4; font-weight: 700; }
    .method-patch { color: #f59e0b; font-weight: 700; }
    pre {
      background: #060913;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #38bdf8;
      overflow-x: auto;
      max-height: 250px;
    }
    footer { text-align: center; color: var(--muted); font-size: 0.8rem; padding-top: 1rem; border-top: 1px solid var(--border); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">🟢 Express REST API Server • Port 5000</div>
      <h1>AquaIndex Backend Control Center</h1>
      <p class="lead">Dedicated Node.js & Mongoose REST API Engine powering Heavy Metal Pollution calculations (HPI & HEI), MongoDB persistence, and security audit logs.</p>
      <div class="btn-group">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" target="_blank" class="btn btn-primary">
          🌊 Open Frontend Portal (Port 5173)
        </a>
        <a href="/api/health" target="_blank" class="btn btn-secondary">
          🔍 View JSON Telemetry (/api/health)
        </a>
        <button onclick="pingHealth()" class="btn btn-secondary">
          ⚡ Run Live API Ping
        </button>
      </div>
    </div>

    <div class="grid">
      <div class="stat-card">
        <div class="stat-label">Database Connection</div>
        <div class="stat-value" style="color: ${dbStatus.isConnected ? '#10b981' : '#ef4444'}">
          ${dbStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
        <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.3rem;">DB: ${dbStatus.dbName}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Server Uptime</div>
        <div class="stat-value">${uptime}s</div>
        <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.3rem;">Node: ${process.version}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Water Samples Stored</div>
        <div class="stat-value">${counts.samples}</div>
        <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.3rem;">Collections: 5 Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Reference Standards</div>
        <div class="stat-value">${counts.standards}</div>
        <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.3rem;">WHO 4th Ed & BIS IS 10500</div>
      </div>
    </div>

    <h2 class="section-title">📡 Active REST API Endpoints</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint Route</th>
            <th>Access Level</th>
            <th>Operational Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/health</code></td>
            <td>Public</td>
            <td>Backend server diagnostics, uptime, and database status</td>
          </tr>
          <tr>
            <td><span class="method-post">POST</span></td>
            <td><code>/api/auth/login</code></td>
            <td>Public</td>
            <td>JWT authentication via ID/Email & Password (Admin/Analyst)</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/auth/users</code></td>
            <td>Admin</td>
            <td>List registered database accounts and privileges</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/samples</code></td>
            <td>Public</td>
            <td>Paginated water quality samples with measurements</td>
          </tr>
          <tr>
            <td><span class="method-post">POST</span></td>
            <td><code>/api/assessments/:id/calculate</code></td>
            <td>Public / Analyst</td>
            <td>Compute Prasad & Bose HPI and Edet & Offiong HEI</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/standards</code></td>
            <td>Public</td>
            <td>Authoritative WHO & BIS heavy metal limit parameters</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/dashboard/summary</code></td>
            <td>Public</td>
            <td>Real-time contamination KPIs and distribution trends</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/reports/samples.csv</code></td>
            <td>Public</td>
            <td>Direct structured analytical CSV data stream</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/audit-logs</code></td>
            <td>Admin</td>
            <td>Immutable security events and administrative audit logs</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 2rem;">
      <h2 class="section-title">⚡ Interactive In-Browser API Test Output</h2>
      <pre id="pingOutput">// Click "Run Live API Ping" above to inspect real-time JSON response from /api/health</pre>
    </div>

    <footer>
      AquaIndex Full-Stack System • Backend REST Server (Port 5000) • Frontend Client (Port 5173) • &copy; 2026 Antigravity
    </footer>
  </div>

  <script>
    async function pingHealth() {
      const output = document.getElementById('pingOutput');
      output.innerText = 'Pinging /api/health...';
      try {
        const start = performance.now();
        const res = await fetch('/api/health');
        const data = await res.json();
        const elapsed = Math.round(performance.now() - start);
        output.innerText = '// Response received in ' + elapsed + 'ms:\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        output.innerText = 'Error calling /api/health: ' + err.message;
      }
    }
  </script>
</body>
</html>`);
});

// Mount API routes
app.use('/api', integrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);

// Catch 404 routes and forward to error handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
