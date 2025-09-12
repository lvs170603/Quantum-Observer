# Quantum Observer

Quantum Observer is a real-time monitoring dashboard for quantum computing jobs and backend systems, built with Next.js, ShadCN UI, and Genkit. It provides a comprehensive view of job statuses, backend health, and performance metrics, along with AI-powered analysis and assistance.

## Features

- **Real-time Job Tracking:** Monitor the status of all quantum jobs (Queued, Running, Completed, Error, Cancelled).
- **Backend Health Dashboard:** View the status, queue depth, and error rates of all available quantum backends.
- **Performance KPIs:** Key metrics at a glance, including live job counts, average wait times, and success rates.
- **Historical Analysis:** Visualize job status trends over time with an interactive chart.
- **AI-Powered Anomaly Detection:** Use Genkit to analyze job data and flag unusual behavior or potential system issues.
- **AI-Powered Dashboard Assistant:** Chat with an AI assistant to get help and information about the dashboard's features.
- **Responsive Design:** A clean and intuitive interface that works seamlessly across desktop and mobile devices.
- **Light & Dark Mode:** Switch between themes for your viewing comfort.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Backend:** [Python](https://www.python.org/) with [FastAPI](https://fastapi.tiangolo.com/)
- **AI Integration:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **UI:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Running Locally

To run the Quantum Observer application on your local machine, you will need to run two separate processes in two terminals: the Next.js frontend and the Python backend.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Python](https://www.python.org/downloads/) (v3.9 or later recommended)
- [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)
- [pip](https://pip.pypa.io/en/stable/installation/)

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone <repository-url>
cd quantum-observer
```

### 2. Set Up Environment Variables

Create a copy of the `.env` file and name it `.env.local`:
```bash
cp .env .env.local
```

Open the `.env.local` file and add your Google AI API key for Genkit features.
```
GEMINI_API_KEY=your_gemini_api_key_here
```
The Python backend uses a hard-coded demo token for the IBM Quantum service. This is for demonstration purposes only. For real-world use, you should modify `main.py` to load credentials securely from environment variables.

### 3. Install Dependencies & Run

#### Terminal 1: Backend (Python + FastAPI)

It is recommended to use a Python virtual environment to manage dependencies.

```bash
# Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`.

#### Terminal 2: Frontend (Next.js)

Install the necessary project dependencies and start the development server:

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`. By default, it runs in "Demo" mode. To connect to your live Python backend, toggle "Demo" mode off in the dashboard settings.

### 4. Run the Genkit Inspector (Optional)

To inspect and debug your Genkit flows, you can run the Genkit Inspector in a separate terminal:

```bash
npm run genkit:dev
```

This will start the inspector, which is typically available at `http://localhost:4000`.

## Project Structure

The project contains a Next.js frontend and a Python backend at the root.

```
quantum-observer/
├── public/                 # Static assets for Next.js
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable React components
│   ├── ai/                 # Genkit AI flows and configuration
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions and type definitions
│
├── .env                    # Environment variable template
├── main.py                 # Python FastAPI backend server
├── requirements.txt        # Python dependencies
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Frontend dependencies and scripts
```
