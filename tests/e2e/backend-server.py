"""Real FastAPI apps against ONLY local admission_test; no AI source modifications."""
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from unittest.mock import patch

service = sys.argv[1]
workspace = Path(__file__).resolve().parents[3]
url = os.environ["DATABASE_URL"]
parsed = urlparse(url)
if parsed.hostname not in ("127.0.0.1", "localhost") or parsed.path != "/admission_test":
    raise RuntimeError("E2E backend requires local admission_test")
repo = workspace / "backend_admission" / ("backend_ai_ml_latest" if service == "ai" else "backend_application_score")
sys.path.insert(0, str(repo))
os.chdir(repo)
import uvicorn
if service == "score":
    import psycopg2
    with psycopg2.connect(url) as conn:
        with conn.cursor() as cursor:
            cursor.execute((repo / "migrations/20261019_candidate_account.sql").read_text())
            cursor.execute((repo / "migrations/20261020_candidate_credentials.sql").read_text())
            cursor.execute((repo / "migrations/20261019_admission_workflow.sql").read_text())
            cursor.execute((repo / "migrations/20261020_profile_lifecycle.sql").read_text())
            # Local fixture DB only; production changes are owned by Prisma migrations.
            cursor.execute("ALTER TABLE bang_diem ADD COLUMN IF NOT EXISTS hoc_ky INTEGER NOT NULL DEFAULT 0")
            cursor.execute("ALTER TABLE giai_thuong ADD COLUMN IF NOT EXISTS file_dinh_kem TEXT")
            cursor.execute("ALTER TABLE thi_sinh ADD COLUMN IF NOT EXISTS activation_otp_hash TEXT, ADD COLUMN IF NOT EXISTS activation_otp_expires TIMESTAMP(6), ADD COLUMN IF NOT EXISTS activation_otp_sent_at TIMESTAMP(6), ADD COLUMN IF NOT EXISTS activation_otp_attempts INTEGER NOT NULL DEFAULT 0")
    from app import app
    uvicorn.run(app, host="127.0.0.1", port=58001, log_level="warning")
else:
    from app import app
    # LLM/SMTP/network vendors are not part of integration validation.
    with patch("src.services.chat_service.llm_client.generate", return_value={"choices": [{"message": {"content": "Synthetic integration answer"}}]}):
        uvicorn.run(app, host="127.0.0.1", port=58000, log_level="warning")
