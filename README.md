# Quantum Observer

This is a Next.js application that provides a real-time dashboard for monitoring IBM Quantum jobs and backend health.

## Features

*   **Live Job Tracking**: View a list of recent and ongoing quantum jobs with their current status.
*   **Backend Health**: Monitor the status, queue depth, and error rates of various quantum backends.
*   **Job Details**: Click on a job to see detailed information, including status history, logs, and results.
*   **AI-Powered Anomaly Detection**: Use AI to analyze job data and flag potential anomalies.
*   **Responsive Design**: The dashboard is designed to work on both desktop and mobile devices.

## Tech Stack

This project is built with a modern, component-based architecture using the following technologies:

*   **[Next.js](https://nextjs.org/)**: A React framework for building full-stack web applications. We use the App Router for server-centric routing and performance.
*   **[React](https://react.dev/)**: A JavaScript library for building user interfaces.
*   **[TypeScript](https://www.typescriptlang.org/)**: A typed superset of JavaScript that enhances code quality and maintainability.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
*   **[ShadCN UI](https://ui.shadcn.com/)**: A collection of beautifully designed, reusable components built on top of Radix UI and Tailwind CSS.
*   **[Genkit](https://firebase.google.com/docs/genkit)**: A toolkit for building production-ready AI-powered features. It is used here for the anomaly detection feature.
*   **[Recharts](https://recharts.org/)**: A composable charting library built on React components, used for the status history graph.
*   **[Lucide React](https://lucide.dev/)**: A simply beautiful and consistent icon toolkit.

## Getting Started

To get started with the project, you can run the development server:

```bash
npm run dev
```

This will start the app on [http://localhost:9002](http://localhost:9002). You can then view and interact with the dashboard in your browser.
