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

  const { content, message } = req.body;

  if (!content) {
    return res.status(400).json({ ok: false, error: 'Missing content' });
  }

  try {
    // Get current index.html SHA
    const checkRes = await githubAPI('index.html');
    if (!checkRes.ok) {
      return res.status(404).json({ ok: false, error: 'index.html not found' });
    }
    const fileData = await checkRes.json();

    // Encode content to base64
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');

    const putRes = await githubAPI('index.html', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || 'Update site content',
        content: base64Content,
        sha: fileData.sha,
        branch: GITHUB_BRANCH
      })
    });

    if (putRes.ok) {
      return res.status(200).json({ ok: true, msg: '内容已同步到 GitHub' });
    } else {
      const err = await putRes.json();
      return res.status(putRes.status).json({ ok: false, error: err.message || 'Update failed' });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
