const GITHUB_REPO = 'linaylil/zhaolongjie03.github.io';
const GITHUB_BRANCH = 'main';

async function githubAPI(path, options = {}, token) {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'personal-website',
    ...options.headers
  };
  return fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    ...options,
    headers
  });
}

export async function onRequestPost(context) {
  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'GITHUB_TOKEN not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await context.request.json();
  const { path, message } = body;

  if (!path) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing path' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const checkRes = await githubAPI(path, {}, token);
    if (!checkRes.ok) {
      return new Response(JSON.stringify({ ok: false, error: 'File not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
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
    }, token);

    if (delRes.ok) {
      return new Response(JSON.stringify({ ok: true, msg: '已从 GitHub 删除' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const err = await delRes.json();
      return new Response(JSON.stringify({ ok: false, error: err.message || 'Delete failed' }), {
        status: delRes.status, headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
