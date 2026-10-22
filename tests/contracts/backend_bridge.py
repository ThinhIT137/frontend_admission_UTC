"""One isolated FastAPI request for a real Next.js adapter contract test.
No running server, production secrets, real LLM, SMTP or production DB are used.
"""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
from unittest.mock import patch

request = json.load(sys.stdin)
repo = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(repo))
os.chdir(repo)
for key in ('DATABASE_URL', 'DATABASE_URL_PUBLIC', 'DIRECT_URL', 'NVIDIA_API_KEY'):
    os.environ[key] = ''
os.environ['INTERNAL_API_KEY'] = 'admin_test_token'
os.environ['DEBUG'] = 'false'

def module_from(path):
    spec = importlib.util.spec_from_file_location('bridge_fixture', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

with contextlib.redirect_stdout(io.StringIO()):
    if repo.name == 'backend_application_score':
        import pytest
        module = module_from(repo / 'tests/integration/conftest.py')
        monkeypatch = pytest.MonkeyPatch()
        fixture = module.api.__wrapped__(monkeypatch)
        api = next(fixture)
        try:
            response = api.client.request(request['method'], request['path'], json=request.get('body'), headers=request.get('headers', {}))
        finally:
            fixture.close()
            monkeypatch.undo()
    else:
        from fastapi.testclient import TestClient
        with patch('psycopg2.connect', side_effect=ConnectionError('isolated test DB')), patch('requests.post', side_effect=AssertionError('external calls disabled')):
            from app import app
            with patch('src.services.chat_service.llm_client.generate', return_value={'choices': [{'message': {'content': 'Synthetic test answer'}}]}), TestClient(app) as client:
                response = client.request(request['method'], request['path'], json=request.get('body'), headers=request.get('headers', {}))
json.dump({'status': response.status_code, 'body': response.json()}, sys.stdout, ensure_ascii=True)
