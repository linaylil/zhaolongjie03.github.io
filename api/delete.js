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

  const { path, message } = req.body;

  if (!path) {
    return res.status(400).json({ ok: false, error: 'Missing path' });
  }

  try {
    // Get file SHA first
    const checkRes = await githubAPI(path);
    if (!checkRes.ok) {
      return res.status(404).json({ ok: false, error: 'File not found' });
    }
    const fileData = await checkRes.json();

    const delRes = await githubAPI(path, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || 'Delete file',
        sha: fileData.sha,
        branch: GITHUB_BRANCH
      })
    });

    if (delRes.ok) {
      return res.status(200).json({ ok: true, msg: '已从 GitHub 删除' });
    } else {
      const err = await delRes.json();
      return res.status(delRes.status).json({ ok: false, error: err.message || 'Delete failed' });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
