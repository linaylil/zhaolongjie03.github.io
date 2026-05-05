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
  const { content, message } = body;

  if (!content) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing content' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const checkRes = await githubAPI('index.html', {}, token);
    if (!checkRes.ok) {
      return new Response(JSON.stringify({ ok: false, error: 'index.html not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }
    const fileData = await checkRes.json();

    const base64Content = btoa(unescape(encodeURIComponent(content)));

    const putRes = await githubAPI('index.html', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || 'Update site content',
        content: base64Content,
        sha: fileData.sha,
        branch: GITHUB_BRANCH
      })
    }, token);

    if (putRes.ok) {
      return new Response(JSON.stringify({ ok: true, msg: '内容已同步到 GitHub' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const err = await putRes.json();
      return new Response(JSON.stringify({ ok: false, error: err.message || 'Update failed' }), {
        status: putRes.status, headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
