const GITHUB_REPO = 'linaylil/zhaolongjie03.github.io';
const GITHUB_BRANCH = 'main';

function getGitHubToken() {
  return process.env.GITHUB_TOKEN;
}

async function githubAPI(path, options = {}) {
  const token = getGitHubToken();
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    ...options.headers
  };
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    ...options,
    headers
  });
  return res;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = getGitHubToken();
  if (!token) {
    return res.status(500).json({ ok: false, error: 'GITHUB_TOKEN not configured on server' });
  }

  const { path, content, message } = req.body;

  if (!path || !content) {
    return res.status(400).json({ ok: false, error: 'Missing path or content' });
  }

  try {
    // Check if file exists to get SHA (for updates)
    let sha = null;
    const checkRes = await githubAPI(path);
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      sha = fileData.sha;
    }

    const body = {
      message: message || 'Upload file',
      content: content,
      branch: GITHUB_BRANCH
    };
    if (sha) body.sha = sha;

    const putRes = await githubAPI(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (putRes.ok) {
      return res.status(200).json({ ok: true, msg: '已同步到 GitHub' });
    } else {
      const err = await putRes.json();
      return res.status(putRes.status).json({ ok: false, error: err.message || 'Upload failed' });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
