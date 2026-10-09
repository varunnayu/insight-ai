# InsightAI - Intelligent Data Analytics Platform

InsightAI is a dataset-adaptive analytics platform designed to simplify data exploration. Upload structured datasets and generate statistical summaries, interactive visualizations, data quality insights, and key performance indicators through a modern web interface.

## Features

- **Dataset Upload:** Upload structured datasets for analysis.
- **Automated Data Profiling:** View row counts, column counts, missing values, duplicate records, and column information.
- **Dynamic Analytics:** Generate relevant statistics and metrics based on the uploaded dataset.
- **Interactive Visualizations:** Explore data through charts and graphical summaries.
- **Data Quality Analysis:** Identify missing values, duplicate records, and potential outliers.
- **Statistical Analysis:** Explore descriptive statistics and relationships between numerical variables.
- **Automated Insights:** Generate rule-based observations from dataset patterns.
- **Dataset History:** Access previously uploaded datasets and switch between datasets, where persistence is configured.
- **Responsive Interface:** Use the dashboard across desktop and mobile screens.

> Note: AI-powered insights requiring an external language model API are currently disabled. InsightAI's available analytics and rule-based insights work independently of that integration.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Recharts
- CSS

### Backend
- Python
- FastAPI
- Pandas
- Uvicorn

### Tools
- Git and GitHub
- VS Code
- Vercel for frontend deployment
- Render for backend deployment

## Project Structure

```text
insight-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/insight-ai.git
cd insight-ai
```

Replace `YOUR_USERNAME` with your GitHub username and `insight-ai` with your repository name if different.

### 2. Set Up the Backend

Open a terminal in the project root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

Health check:

`http://127.0.0.1:8000/health`

### 3. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal, usually:

`http://localhost:5173`

Ensure the frontend API configuration points to your running backend.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend root |
| GET | `/health` | Health check |
| POST | `/api/upload` | Upload a dataset |
| GET | `/api/analyze` | Analyze the active dataset |
| GET | `/api/insights` | Retrieve rule-based insights |
| GET | `/api/ai-insights` | AI insights endpoint, currently not enabled for use |

The exact request parameters and response formats can be explored in the FastAPI documentation at `/docs`.

## Deployment

InsightAI can be deployed using separate frontend and backend services.

### Frontend: Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set the project root directory to `frontend`.
4. Configure the build command as `npm run build`.
5. Set the output directory to `dist`.
6. Configure the production API URL using the environment variable expected by your frontend API service, such as `VITE_API_BASE_URL`.

### Backend: Render

1. Create a new Web Service using your GitHub repository.
2. Set the root directory to `backend`.
3. Build command: `pip install -r requirements.txt`
4. Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Configure FastAPI CORS to allow requests from your deployed frontend.
6. Update the frontend API URL to use your deployed backend.

**Important:** Configure durable storage for uploaded datasets and history before relying on persistence in production. A service's temporary filesystem may lose uploaded files during restarts or redeployments. Choose persistent disk storage or an appropriate database and object-storage solution.

## Environment Configuration

If your application uses environment variables, configure them locally and in your deployment dashboard.

Example frontend environment variable:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Use your deployed backend URL in production.

Never commit API keys, passwords, private credentials, or `.env` files to GitHub.

## Security and Git

Add sensitive and generated files to `.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
venv/
.env
.env.*

# Frontend
node_modules/
dist/

# Local data
uploads/
*.db

# Environment and editor files
.DS_Store
.vscode/
```

If you intentionally use an example environment file, commit only a sanitized `.env.example` containing placeholder values.

## Future Enhancements

- AI-powered natural-language data analysis
- Predictive analytics and forecasting
- Advanced anomaly detection
- Exportable analytics reports
- Enhanced dataset management and persistent storage
- Additional data visualization options

## Project Goal

InsightAI aims to make data analysis more accessible by combining automated data profiling, statistical analysis, interactive charts, and rule-based insights in one platform.

## Author

**Varun K T** 🧑🏽‍💻

- GitHub: [@varunnayu](https://github.com/varunnayu)

---

If you find this project useful, consider giving the repository a star! 🌟
