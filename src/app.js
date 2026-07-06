const express = require("express")
const cookieParser = require("cookie-parser")

const app = express()

app.use(express.json())
app.use(cookieParser())

/**
 * - Routes required
 */
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")

/**
 * - Use Routes
 */

app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Flow API Service</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(20, 26, 43, 0.6);
            --card-border: rgba(255, 255, 255, 0.08);
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.15);
            --success: #10b981;
            --success-glow: rgba(16, 185, 129, 0.15);
            --warning: #f59e0b;
            --warning-glow: rgba(245, 158, 11, 0.15);
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem 1.5rem;
            overflow-x: hidden;
            position: relative;
        }

        body::before {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
            top: -100px;
            left: -100px;
            z-index: 0;
            pointer-events: none;
        }

        body::after {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
            bottom: -100px;
            right: -100px;
            z-index: 0;
            pointer-events: none;
        }

        .container {
            width: 100%;
            max-width: 800px;
            background: var(--card-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 1;
            position: relative;
        }

        header {
            text-align: center;
            margin-bottom: 2.5rem;
        }

        .logo-area {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, var(--primary), #8b5cf6);
            border-radius: 18px;
            margin-bottom: 1.25rem;
            box-shadow: 0 8px 16px var(--primary-glow);
        }

        .logo-area svg {
            width: 32px;
            height: 32px;
            fill: none;
            stroke: white;
            stroke-width: 2;
        }

        h1 {
            font-size: 2.25rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #fff, #9ca3af);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--success-glow);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: var(--success);
            padding: 0.5rem 1.25rem;
            border-radius: 99px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-top: 0.5rem;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background-color: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--success);
            animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.6; }
        }

        .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .endpoint-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .endpoint-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 16px;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 8px;
            transition: all 0.2s ease-in-out;
        }

        .endpoint-card:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.08);
            transform: translateX(4px);
        }

        .endpoint-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
        }

        .endpoint-path {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: monospace;
            font-size: 0.95rem;
        }

        .method {
            font-weight: 700;
            font-size: 0.75rem;
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .method.get {
            background: var(--success-glow);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: var(--success);
        }

        .method.post {
            background: var(--warning-glow);
            border: 1px solid rgba(245, 158, 11, 0.3);
            color: var(--warning);
        }

        .path-text {
            color: var(--text-main);
            font-weight: 500;
        }

        .badges {
            display: flex;
            gap: 6px;
        }

        .badge {
            font-size: 0.7rem;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--text-muted);
        }

        .badge.secure {
            background: rgba(99, 102, 241, 0.1);
            border-color: rgba(99, 102, 241, 0.2);
            color: #a5b4fc;
        }

        .endpoint-desc {
            font-size: 0.875rem;
            color: var(--text-muted);
            line-height: 1.5;
        }

        footer {
            margin-top: 2.5rem;
            text-align: center;
            font-size: 0.8125rem;
            color: var(--text-muted);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo-area">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                    <line x1="6" y1="15" x2="8" y2="15" />
                    <line x1="12" y1="15" x2="16" y2="15" />
                </svg>
            </div>
            <h1>Bank Flow Ledger Service</h1>
            <div class="status-badge">
                <span class="status-dot"></span>
                Server is active & running 🚀
            </div>
        </header>

        <main>
            <div class="section-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color: var(--primary)">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Available API Endpoints to Test:
            </div>

            <div class="endpoint-list">
                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method post">POST</span>
                            <span class="path-text">/api/auth/register</span>
                        </div>
                        <div class="badges"><span class="badge">Public</span></div>
                    </div>
                    <p class="endpoint-desc">Register a new user account with secure credentials.</p>
                </div>

                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method post">POST</span>
                            <span class="path-text">/api/auth/login</span>
                        </div>
                        <div class="badges"><span class="badge">Public</span></div>
                    </div>
                    <p class="endpoint-desc">Authenticate and receive access token inside cookies.</p>
                </div>

                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method post">POST</span>
                            <span class="path-text">/api/auth/logout</span>
                        </div>
                        <div class="badges"><span class="badge">Public</span></div>
                    </div>
                    <p class="endpoint-desc">Clear the authentication cookies.</p>
                </div>

                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method post">POST</span>
                            <span class="path-text">/api/accounts</span>
                        </div>
                        <div class="badges"><span class="badge secure">Auth Required</span></div>
                    </div>
                    <p class="endpoint-desc">Create a new ledger/bank account under the current user.</p>
                </div>

                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method get">GET</span>
                            <span class="path-text">/api/accounts</span>
                        </div>
                        <div class="badges"><span class="badge secure">Auth Required</span></div>
                    </div>
                    <p class="endpoint-desc">Retrieve all bank accounts associated with the logged-in user.</p>
                </div>

                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method get">GET</span>
                            <span class="path-text">/api/accounts/balance/:accountId</span>
                        </div>
                        <div class="badges"><span class="badge secure">Auth Required</span></div>
                    </div>
                    <p class="endpoint-desc">Calculate and return the real-time balance of a specific account using transactions ledger logic.</p>
                </div>

                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method post">POST</span>
                            <span class="path-text">/api/transactions</span>
                        </div>
                        <div class="badges"><span class="badge secure">Auth Required</span></div>
                    </div>
                    <p class="endpoint-desc">Process a transaction to transfer money between accounts with ledger safety rules.</p>
                </div>

                <div class="endpoint-card">
                    <div class="endpoint-header">
                        <div class="endpoint-path">
                            <span class="method post">POST</span>
                            <span class="path-text">/api/transactions/system/initial-funds</span>
                        </div>
                        <div class="badges"><span class="badge secure">System Key Auth</span></div>
                    </div>
                    <p class="endpoint-desc">Initialize funds for an account from the system reserve.</p>
                </div>
            </div>
        </main>

        <footer>
            Bank Flow Ledger Service &bull; Ready for API Clients
        </footer>
    </div>
</body>
</html>
    `)
})

app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRoutes)

module.exports = app