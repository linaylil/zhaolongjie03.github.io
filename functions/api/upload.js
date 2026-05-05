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
  const { path, content, message } = body;

  if (!path || !content) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing path or content' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let sha = null;
    const checkRes = await githubAPI(path, {}, token);
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
    }, token);

    if (putRes.ok) {
      return new Response(JSON.stringify({ ok: true, msg: '已同步到 GitHub' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const err = await putRes.json();
      return new Response(JSON.stringify({ ok: false, error: err.message || 'Upload failed' }), {
        status: putRes.status, headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
