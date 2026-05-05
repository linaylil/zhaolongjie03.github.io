// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ===== Smooth Scroll & Active Nav =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const observerOptions = {
  threshold: 0.3,
  rootMargin: '-80px 0px 0px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

// Add active style via JS
const activeStyle = document.createElement('style');
activeStyle.textContent = `.nav-links a.active { color: var(--primary) !important; background: rgba(37,99,235,0.1) !important; }`;
document.head.appendChild(activeStyle);

// ===== Scroll Animation (Fade In) =====
const fadeElements = document.querySelectorAll(
  '.timeline-card, .edu-card, .skill-card, .hobby-card, .photo-item, .contact-card'
);

fadeElements.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeElements.forEach(el => fadeObserver.observe(el));

// ===== Staggered animation for grids =====
const staggerGroups = [
  '.skills-grid .skill-card',
  '.hobbies-grid .hobby-card',
  '.edu-cards .edu-card',
  '.photos-grid .photo-item',
  '.contact-cards .contact-card',
];

staggerGroups.forEach(selector => {
  const items = document.querySelectorAll(selector);
  items.forEach((item, i) => {
    const origObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 100);
          origObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    origObserver.observe(item);
  });
});

// ===== Profile Photo Upload =====
const heroPhotoContainer = document.getElementById('heroPhotoContainer');
const photoUpload = document.getElementById('photoUpload');
const uploadHint = document.getElementById('uploadHint');

// 从 localStorage 恢复上次上传的照片
const savedPhoto = localStorage.getItem('profilePhoto');
if (savedPhoto) {
  const img = document.getElementById('profilePhoto');
  img.src = savedPhoto;
  img.style.transform = 'none';
  img.style.display = 'block';
  document.getElementById('photoPlaceholder').style.display = 'none';
}

if (heroPhotoContainer) {
  heroPhotoContainer.addEventListener('mouseenter', () => {
    if (uploadHint) uploadHint.style.opacity = '1';
  });
  heroPhotoContainer.addEventListener('mouseleave', () => {
    if (uploadHint) uploadHint.style.opacity = '0';
  });
  heroPhotoContainer.addEventListener('click', () => {
    photoUpload.click();
  });
}

if (photoUpload) {
  photoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      const img = document.getElementById('profilePhoto');
      img.src = dataUrl;
      img.style.transform = 'none';
      img.style.display = 'block';
      document.getElementById('photoPlaceholder').style.display = 'none';
      localStorage.setItem('profilePhoto', dataUrl);
    };
    reader.readAsDataURL(file);
  });
}


// ===== Particle effect in hero =====
(function createParticles() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  const style = document.createElement('style');
  style.textContent = `
    .particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: particleFloat linear infinite;
    }
    @keyframes particleFloat {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 0.5; }
      100% { transform: translateY(-100px) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      background: rgba(${Math.random() > 0.5 ? '37,99,235' : '96,165,250'}, ${Math.random() * 0.4 + 0.1});
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * -15}s;
    `;
    heroBg.appendChild(p);
  }
})();

console.log('👋 赵龙杰的个人网站已加载完成！');

// ===== Admin Mode (Password Protected) =====
const ADMIN_PASSWORD = '20171230zljsl';
const GITHUB_REPO = 'linaylil/zhaolongjie03.github.io';
const GITHUB_BRANCH = 'main';
let GITHUB_TOKEN = localStorage.getItem('githubToken') || '';
let isAdmin = localStorage.getItem('adminMode') === 'true';

function applyAdminMode() {
  // codeflicker-fix: LOGIC-Issue-001/6j8ze6xujk15apwprboq - 改用 CSS hover 替代 JS 事件监听
  if (heroPhotoContainer) {
    heroPhotoContainer.style.cursor = isAdmin ? 'pointer' : 'default';
    const hint = document.getElementById('uploadHint');
    if (hint) {
      // 用 CSS class 控制是否启用 hover 效果
      heroPhotoContainer.classList.toggle('admin-mode', isAdmin);
      if (!isAdmin) hint.style.display = 'none';
    }
  }
  // 简历上传按钮（下方 section）
  const resumeUploadBtn = document.getElementById('resumeUploadBtn');
  if (resumeUploadBtn) resumeUploadBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  // hero 区简历上传按钮（已移除）
  // 照片上传区域
  const photoUploadArea = document.getElementById('photoUploadArea');
  if (photoUploadArea) photoUploadArea.style.display = isAdmin ? 'block' : 'none';
  // 管理员状态指示
  const adminIndicator = document.getElementById('adminIndicator');
  if (adminIndicator) adminIndicator.textContent = isAdmin ? '🔓 管理员模式' : '🔒 访客模式';
}

// 在页脚加管理员入口（隐藏式，三击触发）
let footerClickCount = 0;
let footerClickTimer = null;
document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer') || document.body;
  const adminTrigger = document.createElement('div');
  adminTrigger.id = 'adminIndicator';
  adminTrigger.style.cssText = 'position:fixed;bottom:12px;right:16px;z-index:9999;font-size:0.72rem;color:rgba(255,255,255,0.15);cursor:default;user-select:none;min-width:60px;min-height:20px;text-align:right;';
  adminTrigger.textContent = isAdmin ? '🔓 管理员模式' : '🔒 访客模式';
  document.body.appendChild(adminTrigger);

  // 连续快速点击右下角3次进入管理员模式
  adminTrigger.addEventListener('click', () => {
    footerClickCount++;
    clearTimeout(footerClickTimer);
    footerClickTimer = setTimeout(() => { footerClickCount = 0; }, 600);
    if (footerClickCount >= 3) {
      footerClickCount = 0;
      if (isAdmin) {
        isAdmin = false;
        localStorage.removeItem('adminMode');
        applyAdminMode();
        showToast('已退出管理员模式');
      } else {
        const pwd = prompt('请输入管理员密码：');
        if (pwd === ADMIN_PASSWORD) {
          isAdmin = true;
          localStorage.setItem('adminMode', 'true');
          // 首次进入，提示配置 Token
          if (!GITHUB_TOKEN) {
            const token = prompt('请输入 GitHub Personal Access Token（用于同步照片到仓库）：');
            if (token) {
              GITHUB_TOKEN = token;
              localStorage.setItem('githubToken', token);
            }
          }
          applyAdminMode();
          showToast('✅ 已进入管理员模式');
        } else if (pwd !== null) {
          showToast('❌ 密码错误');
        }
      }
    }
  });

  applyAdminMode();

  // 加载 GitHub 上的画廊照片
  loadGalleryPhotos();

  // 恢复已保存简历
  const savedResume = localStorage.getItem('resumePDF');
  if (savedResume) {
    updateResumeUI(savedResume);
  }
});

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#333;color:white;padding:10px 20px;border-radius:8px;font-size:0.85rem;z-index:99999;transition:opacity 0.3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ===== Resume PDF =====
function updateResumeUI(dataUrl) {
  const resumeSection = document.getElementById('resumeSection');
  const resumeViewBtn = document.getElementById('resumeViewBtn');
  const resumeDownloadBtn = document.getElementById('resumeDownloadBtn');
  const resumeEmpty = document.getElementById('resumeEmpty');
  const heroBtnResume = document.getElementById('heroBtnResume');
  if (resumeSection) resumeSection.style.display = 'flex';
  if (resumeEmpty) resumeEmpty.style.display = 'none';
  // hero 区显示查看简历按钮
  if (heroBtnResume) {
    heroBtnResume.style.display = 'inline-flex';
    heroBtnResume.onclick = () => {
      const win = window.open();
      win.document.write(`<iframe src="${dataUrl}" style="width:100%;height:100vh;border:none;"></iframe>`);
    };
  }
  if (resumeViewBtn) {
    resumeViewBtn.onclick = () => {
      const win = window.open();
      win.document.write(`<iframe src="${dataUrl}" style="width:100%;height:100vh;border:none;"></iframe>`);
    };
  }
  if (resumeDownloadBtn) {
    resumeDownloadBtn.href = dataUrl;
    resumeDownloadBtn.download = '赵龙杰-简历.pdf';
  }
}

// ===== GitHub API: Upload file to repo =====
async function uploadToGitHub(filename, base64Content, commitMsg) {
  if (!GITHUB_TOKEN) {
    showToast('❌ 未配置 GitHub Token，请重新进入管理员模式');
    return false;
  }
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/photos/${filename}`;
  // 检查文件是否已存在（获取 SHA）
  let sha = null;
  try {
    const check = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
    if (check.ok) {
      const data = await check.json();
      sha = data.sha;
    }
  } catch(e) {}

  const body = { message: commitMsg, content: base64Content, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.ok;
}

// ===== Load gallery photos from GitHub =====
async function loadGalleryPhotos() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/photos?ref=${GITHUB_BRANCH}`);
    if (!res.ok) return;
    const files = await res.json();
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name));
    const grid = document.getElementById('photosGrid');
    if (!grid || imageFiles.length === 0) return;
    // 隐藏占位格，插入真实图片
    ['placeholderSlot1','placeholderSlot2','placeholderSlot3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    imageFiles.forEach((file, i) => {
      const existing = grid.querySelector(`[data-github-file="${file.name}"]`);
      if (existing) return;
      const div = document.createElement('div');
      div.className = 'photo-item';
      div.setAttribute('data-github-file', file.name);
      div.innerHTML = `
        <img src="${file.download_url}" alt="生活照片" style="width:100%;height:100%;object-fit:cover;">
        <div class="photo-overlay"><p>生活照片</p></div>
      `;
      grid.appendChild(div);
    });
  } catch(e) {}
}

// ===== Gallery Upload =====
const galleryUpload = document.getElementById('galleryUpload');
if (galleryUpload) {
  galleryUpload.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    showToast(`⏳ 正在上传 ${files.length} 张照片...`);
    let successCount = 0;
    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise(resolve => {
        reader.onload = evt => resolve(evt.target.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const ok = await uploadToGitHub(filename, base64, `Add gallery photo: ${filename}`);
      if (ok) successCount++;
    }
    showToast(`✅ ${successCount}/${files.length} 张照片已同步到 GitHub！约1-2分钟后所有人可见`);
    setTimeout(() => loadGalleryPhotos(), 3000);
    e.target.value = '';
  });
}

const resumeUpload = document.getElementById('resumeUpload');if (resumeUpload) {
  resumeUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      localStorage.setItem('resumePDF', dataUrl);
      updateResumeUI(dataUrl);
      showToast('✅ 简历上传成功');
    };
    reader.readAsDataURL(file);
  });
}
