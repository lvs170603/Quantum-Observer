# **App Name**: Quantum Observer

## Core Features:

- KPI Display: Display key performance indicators (KPIs) related to live jobs, average wait time, success rate and open sessions. This includes automatic refresh and display of last updated timestamp.
- Backend Grid: Present a grid detailing backend status, qubit count, queue depth and error rate, facilitating at-a-glance device health monitoring.
- Live Jobs Table: Offer a sortable and filterable table of live jobs, with Job ID, status, backend, submission time, elapsed time and user information.
- Status Over Time Chart: Show a stacked area chart visualizing job statuses over time to quickly identify trends.
- Job Details Drawer: Provide a detailed drawer/modal to display job specifics such as status history, logs, and interim results upon selection in the Live Jobs Table.
- Live/Demo Toggle: Ability to toggle between fetching live data and using static demo JSON data stored in Firestore for offline demonstration and development purposes.
- Anomaly Detection: Provide AI powered insights using job data analysis to flag anomalies. The AI LLM tool monitors overall queueing and execution behavior, looks for anomalous behavior and notifies admin users of irregularities that should be investigated.

## Style Guidelines:

- Primary color: #5680E9 (a saturated blue-purple); this energetic color speaks to innovation while avoiding a strictly technological feel.
- Background color: #E8EEFC (a very pale tint of the primary blue-purple).
- Accent color: #8456E9 (a more saturated version of the primary); it serves to draw attention.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern, machined, objective, neutral look; suitable for headlines or body text
- Code font: 'Source Code Pro' for displaying code snippets.
- Crisp, minimalist icons representing quantum computing concepts and backend status, ensuring clarity and ease of understanding.
- A clean, modular layout with clear visual hierarchy, prioritizing key metrics and providing easy access to detailed information through interactive elements.