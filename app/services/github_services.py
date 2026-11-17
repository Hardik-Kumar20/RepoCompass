
import os

import httpx


GITHUB_API = "https://api.github.com"


async def search_open_issues(
    languages: list[str],
    interest: str = "",
    limit: int = 10,
) -> list[dict]:
    """
    Search GitHub for real open issues matching the requested languages.
    """

    query_parts = ["is:issue", "is:open"]

    # GitHub issue search supports language qualifiers for repositories.
    clean_languages = [
        language.strip()
        for language in languages
        if language.strip()
    ]

    if clean_languages:
        language_query = " ".join(
            f"language:{language}" for language in clean_languages
        )
        query_parts.append(f"({language_query})")

    if interest.strip():
        query_parts.append(interest.strip())

    query = " ".join(query_parts)

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    params = {
        "q": query,
        "sort": "created",
        "order": "desc",
        "per_page": min(max(limit, 1), 30),
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{GITHUB_API}/search/issues",
            headers=headers,
            params=params,
        )

    response.raise_for_status()
    data = response.json()

    results = []

    for issue in data.get("items", []):
        repository = issue.get("repository_url", "").replace(
            f"{GITHUB_API}/repos/", ""
        )

        results.append({
            "title": issue.get("title", ""),
            "repo": repository,
            "url": issue.get("html_url", ""),
            "description": (issue.get("body") or "")[:300],
            "language": None,
            "labels": [
                label.get("name", "")
                for label in issue.get("labels", [])
            ],
            "created_at": issue.get("created_at"),
            "comments": issue.get("comments", 0),
        })

    return results




async def search_repositories(idea: str, limit: int = 10) -> list[dict]:
    """Find real GitHub repositories related to a project idea."""
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    params = {
        "q": idea,
        "sort": "stars",
        "order": "desc",
        "per_page": min(max(limit, 1), 30),
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{GITHUB_API}/search/repositories",
            headers=headers,
            params=params,
        )

    response.raise_for_status()
    data = response.json()

    return [
        {
            "name": repo["full_name"],
            "url": repo["html_url"],
            "description": repo.get("description") or "No description provided.",
            "language": repo.get("language") or "Not specified",
            "stars": repo.get("stargazers_count", 0),
        }
        for repo in data.get("items", [])
    ]







async def get_codebase_guide(owner: str, repo: str) -> dict:
    """Fetch a public GitHub repository's README and file tree."""
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=20.0) as client:
        repo_response = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}",
            headers=headers,
        )
        repo_response.raise_for_status()
        repo_data = repo_response.json()

        readme_response = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/readme",
            headers=headers,
        )

        readme = ""
        if readme_response.status_code == 200:
            readme_data = readme_response.json()
            import base64
            readme = base64.b64decode(
                readme_data.get("content", "")
            ).decode("utf-8", errors="replace")[:12000]

        branch = repo_data.get("default_branch", "main")
        tree_response = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{branch}",
            headers=headers,
            params={"recursive": "1"},
        )
        tree_response.raise_for_status()
        tree_data = tree_response.json()

    files = [
        item["path"]
        for item in tree_data.get("tree", [])
        if item.get("type") == "blob"
    ][:100]

    return {
        "name": repo_data.get("full_name"),
        "description": repo_data.get("description"),
        "language": repo_data.get("language"),
        "stars": repo_data.get("stargazers_count", 0),
        "url": repo_data.get("html_url"),
        "readme": readme,
        "files": files,
        "truncated": tree_data.get("truncated", False),
    }

