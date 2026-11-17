
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.services.github_services import (
    search_open_issues,
    search_repositories,
    get_codebase_guide,
)


app = FastAPI(
    title="RepoCompass API",
    description="Discover open-source contributions and repositories.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "project": "RepoCompass"}


@app.get("/api/issues")
async def get_issues(
    languages: str = Query(
        default="Python,JavaScript",
        description="Comma-separated programming languages",
    ),
    interest: str = Query(
        default="",
        description="Optional topic or issue keyword",
    ),
    limit: int = Query(default=10, ge=1, le=30),
):
    language_list = [
        language.strip()
        for language in languages.split(",")
        if language.strip()
    ]

    try:
        issues = await search_open_issues(
            languages=language_list,
            interest=interest,
            limit=limit,
        )

        return {
            "count": len(issues),
            "issues": issues,
        }

    except Exception as exc:
        # Do not expose internal server details to the client.
        print(f"GitHub issue search failed: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch GitHub issues. Please try again.",
        )
    


@app.get("/api/projects")
async def get_projects(
    idea: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(default=10, ge=1, le=30),
):
    try:
        projects = await search_repositories(idea, limit)
        return {
            "count": len(projects),
            "projects": projects,
        }
    except Exception as exc:
        print(f"GitHub repository search failed: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch GitHub repositories. Please try again.",
        )





@app.get("/api/codebase")
async def codebase_guide(
    url: str = Query(..., description="Public GitHub repository URL"),
):
    import re

    match = re.fullmatch(
        r"https?://github\.com/([^/]+)/([^/]+)/?",
        url.strip(),
    )

    if not match:
        raise HTTPException(
            status_code=400,
            detail="Enter a valid URL like https://github.com/fastapi/fastapi",
        )

    owner, repo = match.groups()

    try:
        guide = await get_codebase_guide(owner, repo)
        return guide
    except Exception as exc:
        print(f"Codebase guide failed: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve this repository. Check that it is public.",
        )





BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

if STATIC_DIR.exists():
    app.mount(
        "/static",
        StaticFiles(directory=STATIC_DIR),
        name="static",
    )
