
import logging
import hashlib
from datetime import timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from qiskit_ibm_runtime import QiskitRuntimeService

# -------------------------
# Logging
# -------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quantum-tracker")

# -------------------------
# IBM Quantum Credentials (⚠️ demo)
# -------------------------
# It is recommended to move these to environment variables for production
TOKEN = "7uB1rS41OFhMS_7U9HUwE1bD7ApCAvuNoXC1CpufFL1R"
INSTANCE = "crn:v1:bluemix:public:quantum-computing:us-east:a/f337e67a23db46a7b912221b7e84e282:6bac78c7-3180-4d7f-9e06-1cc288de4f52::"
CHANNEL = "ibm_cloud"

service = None
try:
    if TOKEN and INSTANCE:
        service = QiskitRuntimeService(
            channel=CHANNEL,
            token=TOKEN,
            instance=INSTANCE
        )
        logger.info("✅ Connected to IBM Quantum Runtime service")
    else:
        logger.warning("⚠️ IBM Quantum credentials not found. API will not connect.")
except Exception as e:
    logger.exception("❌ Failed to connect to IBM Quantum: %s", e)
    # We don't raise here, to allow the app to run in a disconnected state.
    
# -------------------------
# FastAPI app
# -------------------------
app = FastAPI(title="IBM Quantum Job Tracker")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Helpers
# -------------------------
STATUS_MAP = {
    "QUEUED": "QUEUED",
    "RUNNING": "RUNNING",
    "COMPLETED": "COMPLETED",
    "ERROR": "ERROR",
    "CANCELLED": "CANCELLED",
    "CANCELED": "CANCELLED",
    "DONE": "COMPLETED"
}

def normalize_status(status_obj: Any) -> str:
    try:
        if not status_obj:
            return "UNKNOWN"
        
        # The status object from the API can be an enum or a string
        s = ""
        if hasattr(status_obj, 'name'):
            s = status_obj.name
        elif isinstance(status_obj, str):
            s = status_obj
        else:
            s = str(status_obj)

        s_upper = s.upper()
        return STATUS_MAP.get(s_upper, "ERROR") # Default to ERROR for unknown statuses
    except Exception:
        logger.exception("Error normalizing status: %s", status_obj)
        return "ERROR"

def mask_user_id(user_id: str) -> str:
    if not user_id:
        return "Quantum User"
    hashed = hashlib.sha256(user_id.encode()).hexdigest()
    return f"user_{hashed[:6]}"

def safe_call(obj, attr, default=None):
    try:
        val = getattr(obj, attr, default)
        return val() if callable(val) else val
    except Exception:
        return default

def job_to_dict(job) -> dict:
    # Backend
    backend_name = "Unknown"
    try:
        backend = job.backend()
        if backend:
            backend_name = backend.name
    except Exception:
        pass

    # Status
    status = normalize_status(safe_call(job, "status"))

    # Dates
    created = safe_call(job, "creation_date")
    created_iso = created.astimezone(timezone.utc).isoformat() if created else None
    
    # History
    status_history = []
    if created_iso:
        status_history.append({"status": "QUEUED", "timestamp": created_iso})
    
    time_per_step = safe_call(job, "time_per_step") or {}
    if 'RUNNING' in time_per_step:
         status_history.append({"status": "RUNNING", "timestamp": time_per_step['RUNNING'].isoformat()})
    if 'COMPLETED' in time_per_step:
         status_history.append({"status": "COMPLETED", "timestamp": time_per_step['COMPLETED'].isoformat()})
    
    # If the job is finished, make sure there's a final status entry.
    end_time_iso = time_per_step.get('FINISHED', None)
    if end_time_iso and status not in ['RUNNING', 'QUEUED']:
        status_history.append({"status": status, "timestamp": end_time_iso.isoformat()})


    # Other fields
    qpu_seconds = safe_call(job.usage, "qpu_seconds", 0)
    error_message = safe_call(job, "error_message") or ""
    
    if status == "COMPLETED" and not error_message:
        logs = "Job executed successfully."
    elif error_message:
        logs = f"Error: {error_message}"
    else:
        logs = f"Job status: {status}"

    # User - Simplified for this context
    masked_user = "Alice" # Placeholder

    # Results
    results_obj = safe_call(job, "result")
    results = {}
    if results_obj:
        try:
            # We assume a simple counts structure for the prototype
            counts = results_obj.get_counts()
            results = dict(counts)
        except Exception:
            results = {"info": "Could not parse results."}


    return {
        "id": safe_call(job, "job_id"),
        "status": status,
        "backend": backend_name,
        "submitted": created_iso,
        "elapsed_time": safe_call(job, "time_taken", 0.0),
        "user": masked_user,
        "qpu_seconds": qpu_seconds,
        "logs": logs,
        "results": results,
        "status_history": status_history
    }

# -------------------------
# API Routes
# -------------------------
@app.get("/api/jobs")
def list_jobs(limit: int = 50, descending: bool = True):
    if not service:
        raise HTTPException(status_code=503, detail="IBM Quantum service is not available.")
    try:
        jobs = service.jobs(limit=limit, descending=descending)
        return [job_to_dict(j) for j in jobs]
    except Exception as e:
        logger.exception("Error listing jobs: %s", e)
        raise HTTPException(status_code=500, detail={"error": str(e)})

@app.get("/api/backends")
def list_backends():
    if not service:
        raise HTTPException(status_code=503, detail="IBM Quantum service is not available.")
    try:
        backends = service.backends(min_num_qubits=5) # Filter for usable backends
        out = []
        for b in backends:
            if b.simulator: continue
            try:
                status_obj = b.status()
                out.append({
                    "name": b.name,
                    "status": "active" if status_obj.operational else "inactive",
                    "qubit_count": b.num_qubits,
                    "queue_depth": status_obj.pending_jobs,
                    "error_rate": getattr(b, "error_rate", 0.01) # This is a placeholder
                })
            except Exception as e:
                logger.warning("Could not process backend %s: %s", b.name, e)
                continue
        return out
    except Exception as e:
        logger.exception("Error listing backends: %s", e)
        raise HTTPException(status_code=500, detail={"error": str(e)})

# Health check
@app.get("/")
def read_root():
    return {"status": "Quantum Tracker API is running"}

    