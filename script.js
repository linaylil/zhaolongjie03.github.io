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
  // 管理员 hover 才显示上传提示
  heroPhotoContainer.addEventListener('mouseenter', () => {
    if (isAdmin && uploadHint) uploadHint.style.opacity = '1';
  });
  heroPhotoContainer.addEventListener('mouseleave', () => {
    if (isAdmin && uploadHint) uploadHint.style.opacity = '0';
  });
  // uploadHint 按钮点击触发文件选择
  if (uploadHint) {
    uploadHint.addEventListener('click', (e) => {
      e.stopPropagation();
      photoUpload.click();
    });
  }
  // 访客点击头像 → lightbox（由全局 click 处理）
}

if (photoUpload) {
  photoUpload.addEventListener('change', async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    // HEIC → JPEG
    const heicBlob = await convertHeicFile(file);
    if (heicBlob) {
      file = new File([heicBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
    }
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
let isAdmin = localStorage.getItem('adminMode') === 'true';

// ===== Section visibility settings =====
let showPhotos = true;

// 从 GitHub 加载配置
async function loadConfig() {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  try {
    const url = isLocal
      ? `/config.json?t=${Date.now()}`
      : `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/config.json?t=${Date.now()}`;
    const res = await fetch(url);
    if (res.ok) {
      const config = await res.json();
      if (config.showPhotos !== undefined) showPhotos = config.showPhotos;
    }
  } catch (e) {}
  applySectionVisibility();
}

function applySectionVisibility() {
  // 照片区
  const photosSection = document.getElementById('photos');
  const navPhotos = document.getElementById('navPhotos');
  const heroBtnPhotos = document.getElementById('heroBtnPhotos');
  if (photosSection) photosSection.style.display = showPhotos ? '' : 'none';
  if (navPhotos) navPhotos.parentElement.style.display = showPhotos ? '' : 'none';
  if (heroBtnPhotos) heroBtnPhotos.style.display = showPhotos ? '' : 'none';
}

function openAdminPanel() {
  const panel = document.getElementById('adminPanel');
  const overlay = document.getElementById('adminPanelOverlay');
  if (panel) {
    document.getElementById('togglePhotos').checked = showPhotos;
    panel.style.display = 'block';
  }
  if (overlay) overlay.style.display = 'block';
}

function closeAdminPanel() {
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminPanelOverlay').style.display = 'none';
}

async function saveAdminSettings() {
  showPhotos = document.getElementById('togglePhotos').checked;
  localStorage.setItem('showPhotos', showPhotos);
  applySectionVisibility();
  closeAdminPanel();
  // 同步 config.json 到 GitHub
  const config = { showPhotos };
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
  showToast('⏳ 正在保存设置...');
  const ok = await uploadToServer('config.json', base64, 'Update section visibility settings');
  if (ok) showToast('✅ 显示设置已保存');
}

function applyAdminMode() {
  document.body.classList.toggle('admin-mode', isAdmin);
  // codeflicker-fix: LOGIC-Issue-001/6j8ze6xujk15apwprboq - 改用 CSS hover 替代 JS 事件监听
  if (heroPhotoContainer) {
    heroPhotoContainer.style.cursor = isAdmin ? 'pointer' : 'zoom-in';
    const hint = document.getElementById('uploadHint');
    if (hint) {
      heroPhotoContainer.classList.toggle('admin-mode', isAdmin);
      if (!isAdmin) hint.style.display = 'none';
    }
  }
  const photoUploadArea = document.getElementById('photoUploadArea');
  if (photoUploadArea) photoUploadArea.style.display = isAdmin ? 'block' : 'none';
  const adminIndicator = document.getElementById('adminIndicator');
  if (adminIndicator) adminIndicator.textContent = isAdmin ? '🔓 管理员模式' : '🔒 访客模式';
  const adminSettingsBtn = document.getElementById('adminSettingsBtn');
  if (adminSettingsBtn) adminSettingsBtn.style.display = isAdmin ? 'block' : 'none';
  // Admin-only features: delete & edit
  if (isAdmin) {
    addPhotoDeleteBtns();
    enableExperienceEdit();
    enablePhotoDrag();
  } else {
    // 退出管理员模式时移除拖拽
    document.querySelectorAll('.photo-item[data-github-file]').forEach(item => {
      item.removeAttribute('draggable');
    });
  }
  applySectionVisibility();
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

  // 管理员模式下显示设置按钮
  const adminSettingsBtn = document.createElement('div');
  adminSettingsBtn.id = 'adminSettingsBtn';
  adminSettingsBtn.style.cssText = 'position:fixed;bottom:36px;right:16px;z-index:10000;font-size:0.72rem;color:rgba(255,255,255,0.5);cursor:pointer;user-select:none;display:none;padding:4px 6px;border-radius:4px;';
  adminSettingsBtn.textContent = '⚙️ 照片设置';
  adminSettingsBtn.addEventListener('click', (e) => { e.stopPropagation(); openAdminPanel(); });
  document.body.appendChild(adminSettingsBtn);

  // 连续快速点击右下角3次进入/退出管理员模式
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
          applyAdminMode();
          showToast('✅ 已进入管理员模式');
        } else if (pwd !== null) {
          showToast('❌ 密码错误');
        }
      }
    }
  });

  // 管理面板 overlay 点击关闭
  const overlay = document.getElementById('adminPanelOverlay');
  if (overlay) overlay.addEventListener('click', closeAdminPanel);

  applyAdminMode();

  // 从 GitHub 加载显示配置
  loadConfig();

  // 加载 GitHub 上的画廊照片
  loadGalleryPhotos();

  // 手机端 tag 点击交互
  document.querySelectorAll('.tag[data-tip]').forEach(tag => {
    tag.addEventListener('click', (e) => {
      // 关闭其他已激活的 tag
      document.querySelectorAll('.tag[data-tip].active').forEach(t => {
        if (t !== tag) t.classList.remove('active');
      });
      tag.classList.toggle('active');
      e.stopPropagation();
    });
  });
  // 点击空白处关闭 tooltip
  document.addEventListener('click', () => {
    document.querySelectorAll('.tag[data-tip].active').forEach(t => t.classList.remove('active'));
  });

  // 照片点击全屏查看 (lightbox)
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  // 点击照片区域和头像打开 lightbox
  document.addEventListener('click', (e) => {
    // 删除按钮点击不触发 lightbox
    if (e.target.closest('.photo-delete-btn')) return;
    const photoItem = e.target.closest('.photo-item');
    if (photoItem) {
      const img = photoItem.querySelector('img');
      if (img && img.src) {
        e.preventDefault();
        openLightbox(img.src);
        return;
      }
    }
    // hero 头像也支持点击放大
    const heroPhoto = e.target.closest('.hero-photo');
    if (heroPhoto) {
      const img = heroPhoto.querySelector('img');
      if (img && img.src && img.style.display !== 'none') {
        openLightbox(img.src);
        return;
      }
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // 移动端滑动关闭 lightbox
  let touchStartY = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaY) > 80) closeLightbox();
    }, { passive: true });
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

// ===== File Upload / Delete via local server.py (SSH git push) =====
const API_BASE = '/api';

function fetchWithTimeout(url, options, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

async function uploadToServer(filepath, base64Content, commitMsg) {
  try {
    const response = await fetchWithTimeout(API_BASE + '/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filepath, content: base64Content, message: commitMsg })
    });
    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      if (result.ok) return true;
      showToast(`❌ ${result.error || '上传失败'}`);
    } else {
      showToast('⚠️ 请确保 server.py 正在运行 (python3 server.py)');
    }
  } catch(e) {
    showToast('⚠️ 无法连接本地服务器，请运行 python3 server.py');
  }
  return false;
}

async function uploadToServerRaw(filepath, rawContent, commitMsg) {
  try {
    const response = await fetchWithTimeout(API_BASE + '/update-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: rawContent, message: commitMsg })
    });
    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      if (result.ok) { showToast(`✅ ${result.msg}`); return true; }
      showToast(`❌ ${result.error || '保存失败'}`);
    } else {
      showToast('⚠️ 请确保 server.py 正在运行');
    }
  } catch(e) {
    showToast(e.name === 'AbortError' ? '❌ 请求超时' : '⚠️ 无法连接本地服务器');
  }
  return false;
}

// 清理运行时注入的 DOM（保存前调用，防止污染 HTML）
function cleanRuntimeDOM() {
  ['adminIndicator', 'adminSettingsBtn', 'toast'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  // 清理运行时样式
  document.querySelectorAll('.particle').forEach(el => el.remove());
  // 清理 editing 状态
  document.querySelectorAll('.editing').forEach(el => el.classList.remove('editing'));
  // 清理 contentEditable
  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.removeAttribute('contenteditable');
    el.style.outline = '';
    el.style.background = '';
  });
}

// ===== Delete file via server.py =====
async function deleteFromServer(filepath, commitMsg) {
  try {
    const response = await fetchWithTimeout(API_BASE + '/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filepath, message: commitMsg })
    });
    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      if (result.ok) { showToast(`✅ ${result.msg}`); return true; }
      showToast(`❌ ${result.error || '删除失败'}`);
    } else {
      showToast('⚠️ 请确保 server.py 正在运行');
    }
  } catch(e) {
    showToast('⚠️ 无法连接本地服务器');
  }
  return false;
}

// uploadToGitHub 是 uploadToServer 的别名，用于画廊照片
async function uploadToGitHub(filename, base64Content, commitMsg) {
  return uploadToServer(`photos/${filename}`, base64Content, commitMsg);
}

// ===== HEIC support =====
function loadHeic2Any() {
  return new Promise((resolve) => {
    if (window.heic2any) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://cdn.bootcdn.net/ajax/libs/heic2any/0.0.4/heic2any.min.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

async function convertHeicImage(imgEl, heicUrl) {
  const ok = await loadHeic2Any();
  if (!ok) { imgEl.alt = 'HEIC格式不支持'; return; }
  try {
    const resp = await fetch(heicUrl);
    const blob = await resp.blob();
    const converted = await heic2any({ blob, toType: 'image/jpeg', quality: 0.92 });
    const jpgBlob = Array.isArray(converted) ? converted[0] : converted;
    imgEl.src = URL.createObjectURL(jpgBlob);
  } catch(e) {
    imgEl.alt = 'HEIC转换失败';
  }
}

async function convertHeicFile(file) {
  if (!/\.heic$/i.test(file.name) && !/heic/i.test(file.type)) return null;
  const ok = await loadHeic2Any();
  if (!ok) return null;
  try {
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    return Array.isArray(converted) ? converted[0] : converted;
  } catch(e) { return null; }
}

// ===== EXIF rotation fix =====
function fixImageOrientation(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const arr = new Uint8Array(e.target.result);
    // Check EXIF orientation
    let orientation = 1;
    if (arr.length > 4 && arr[0] === 0xFF && arr[1] === 0xD8) {
      let offset = 2;
      while (offset < arr.length) {
        if (arr[offset] !== 0xFF) break;
        const marker = arr[offset + 1];
        if (marker === 0xE1) {
          // Found EXIF
          const exifOffset = offset + 4;
          if (exifOffset + 8 < arr.length) {
            const tiffOffset = exifOffset + 4;
            const bigEndian = arr[tiffOffset] === 0x4D && arr[tiffOffset + 1] === 0x4D;
            const littleEndian = arr[tiffOffset] === 0x49 && arr[tiffOffset + 1] === 0x49;
            if (bigEndian || littleEndian) {
              let idx = tiffOffset + (bigEndian ? 8 : 8);
              const tags = bigEndian ? (arr[idx] << 8 | arr[idx+1]) : (arr[idx+1] << 8 | arr[idx]);
              idx = tiffOffset + (bigEndian ? 10 : 10);
              for (let i = 0; i < tags && idx + 12 <= arr.length; i++) {
                const tag = bigEndian ? (arr[idx] << 8 | arr[idx+1]) : (arr[idx+1] << 8 | arr[idx]);
                if (tag === 0x0112) {
                  idx += (bigEndian ? 8 : 8);
                  orientation = bigEndian ? arr[idx] : arr[idx];
                  break;
                }
                idx += 12;
              }
            }
          }
          break;
        }
        offset += 2 + (arr[offset + 2] << 8 | arr[offset + 3]) + 2;
      }
    }
    
    // Now draw canvas with rotation
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let w = img.width, h = img.height;
      if (orientation >= 5 && orientation <= 8) { w = img.height; h = img.width; }
      canvas.width = w; canvas.height = h;
      switch(orientation) {
        case 2: ctx.transform(-1,0,0,1,w,0); break;
        case 3: ctx.transform(-1,0,0,-1,w,h); break;
        case 4: ctx.transform(1,0,0,-1,0,h); break;
        case 5: ctx.transform(0,1,1,0,0,0); break;
        case 6: ctx.transform(0,1,-1,0,h,0); break;
        case 7: ctx.transform(0,-1,-1,0,h,w); break;
        case 8: ctx.transform(0,-1,1,0,0,w); break;
      }
      ctx.drawImage(img, 0, 0);
      callback(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = URL.createObjectURL(file);
  };
  reader.readAsArrayBuffer(file);
}

// ===== Load gallery photos from GitHub =====
async function loadGalleryPhotos() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/photos?ref=${GITHUB_BRANCH}`);
    if (!res.ok) {
      // API 频率限制时，尝试从 photo-order.json 恢复已知文件列表
      if (res.status === 403 || res.status === 429) {
        await loadGalleryFromOrder();
      }
      return;
    }
    const files = await res.json();
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name) && f.name !== '.gitkeep');
    const grid = document.getElementById('photosGrid');
    if (!grid || imageFiles.length === 0) return;
    ['placeholderSlot1','placeholderSlot2','placeholderSlot3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // 尝试读取排序配置
    let order = [];
    try {
      const orderRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/photo-order.json?ref=${GITHUB_BRANCH}`);
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        order = JSON.parse(atob(orderData.content));
      }
    } catch(e) {}

    // 按 order 排序，未在 order 中的排在最后
    const sortedFiles = order.length > 0
      ? [...imageFiles].sort((a, b) => {
          const ia = order.indexOf(a.name);
          const ib = order.indexOf(b.name);
          if (ia === -1 && ib === -1) return 0;
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        })
      : imageFiles;

    sortedFiles.forEach((file) => {
      const existing = grid.querySelector(`[data-github-file="${file.name}"]`);
      if (existing) return;
      const div = document.createElement('div');
      div.className = 'photo-item';
      div.setAttribute('data-github-file', file.name);
      div.innerHTML = `
        <img src="${file.download_url}" alt="生活照片" style="width:100%;height:100%;object-fit:cover;">
        <div class="photo-overlay"><p>我的照片</p></div>
      `;
      grid.appendChild(div);
    });
    // 照片加载完后添加删除按钮 & 拖拽
    if (isAdmin) {
      addPhotoDeleteBtns();
      enablePhotoDrag();
    }
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
      let processFile = file;
      // HEIC → JPEG 转换
      const heicBlob = await convertHeicFile(file);
      if (heicBlob) {
        processFile = new File([heicBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      }
      const base64 = await new Promise(resolve => {
        fixImageOrientation(processFile, (fixedDataUrl) => {
          resolve(fixedDataUrl.split(',')[1]);
        });
      });
      const filename = `${Date.now()}_${processFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const ok = await uploadToGitHub(filename, base64, `Add gallery photo: ${filename}`);
      if (ok) successCount++;
    }
    showToast(`✅ ${successCount}/${files.length} 张照片已同步到 GitHub`);
    setTimeout(() => loadGalleryPhotos(), 3000);
    e.target.value = '';
  });
}

// ===== Photo Delete Buttons =====
function addPhotoDeleteBtns() {
  document.querySelectorAll('.photo-item[data-github-file]').forEach(item => {
    if (item.querySelector('.photo-delete-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'photo-delete-btn';
    btn.innerHTML = '<i class="fas fa-times"></i>';
    const filename = item.getAttribute('data-github-file');
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm('确定要删除这张照片吗？')) return;
      const ok = await deleteFromServer(`photos/${filename}`, `Delete photo: ${filename}`);
      if (ok) {
        item.remove();
        const remaining = document.querySelectorAll('.photo-item[data-github-file]');
        if (remaining.length === 0) {
          ['placeholderSlot1','placeholderSlot2','placeholderSlot3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
          });
        }
      }
    };
    item.appendChild(btn);
  });
}

// ===== Photo Drag-to-Reorder =====
let dragSrcItem = null;

function enablePhotoDrag() {
  const grid = document.getElementById('photosGrid');
  if (!grid) return;
  grid.querySelectorAll('.photo-item[data-github-file]').forEach(item => {
    if (item.getAttribute('draggable') === 'true') return;
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', (e) => {
      dragSrcItem = item;
      e.dataTransfer.effectAllowed = 'move';
      item.style.opacity = '0.5';
    });
    item.addEventListener('dragend', () => {
      item.style.opacity = '';
      grid.querySelectorAll('.photo-item').forEach(i => i.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      grid.querySelectorAll('.photo-item').forEach(i => i.classList.remove('drag-over'));
      if (item !== dragSrcItem) item.classList.add('drag-over');
    });
    item.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragSrcItem && dragSrcItem !== item) {
        const items = [...grid.querySelectorAll('.photo-item[data-github-file]')];
        const srcIdx = items.indexOf(dragSrcItem);
        const dstIdx = items.indexOf(item);
        if (srcIdx < dstIdx) {
          grid.insertBefore(dragSrcItem, item.nextSibling);
        } else {
          grid.insertBefore(dragSrcItem, item);
        }
        item.classList.remove('drag-over');
        // 保存顺序
        await savePhotoOrder();
      }
    });
  });
}

// 当 GitHub API 被限速时，从 photo-order.json 直接构造图片 URL 展示
async function loadGalleryFromOrder() {
  const grid = document.getElementById('photosGrid');
  if (!grid) return;
  const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/photos/`;
  let order = [];
  try {
    const r = await fetch(`${RAW_BASE.replace('/photos/', '/')}photo-order.json`);
    if (r.ok) order = await r.json();
  } catch(e) {}
  if (!order.length) return;
  ['placeholderSlot1','placeholderSlot2','placeholderSlot3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  order.forEach(name => {
    if (grid.querySelector(`[data-github-file="${name}"]`)) return;
    const div = document.createElement('div');
    div.className = 'photo-item';
    div.setAttribute('data-github-file', name);
    div.innerHTML = `
      <img src="${RAW_BASE}${name}" alt="生活照片" style="width:100%;height:100%;object-fit:cover;">
      <div class="photo-overlay"><p>我的照片</p></div>
    `;
    grid.appendChild(div);
  });
  if (isAdmin) { addPhotoDeleteBtns(); enablePhotoDrag(); }
}

async function savePhotoOrder() {
  const grid = document.getElementById('photosGrid');
  if (!grid) return;
  const order = [...grid.querySelectorAll('.photo-item[data-github-file]')].map(i => i.getAttribute('data-github-file'));
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(order, null, 2))));
  await uploadToServer('photo-order.json', base64, 'Update photo order');
}

// ===== Experience Inline Edit =====
function enableExperienceEdit() {
  // 实习经历卡片
  document.querySelectorAll('.timeline-card').forEach(card => {
    let editBtn = card.querySelector('.edit-card-btn');
    if (!editBtn) {
      editBtn = document.createElement('button');
      editBtn.className = 'edit-card-btn';
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';
      card.style.position = 'relative';
      card.appendChild(editBtn);
    }
    // 重新绑定（避免重复）
    editBtn.replaceWith(editBtn.cloneNode(true));
    editBtn = card.querySelector('.edit-card-btn');
    editBtn.onclick = (e) => { e.stopPropagation(); startCardEdit(card); };
  });
  
  // 个人技能卡片
  document.querySelectorAll('.skill-card').forEach(card => {
    let editBtn = card.querySelector('.edit-card-btn');
    if (!editBtn) {
      editBtn = document.createElement('button');
      editBtn.className = 'edit-card-btn';
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';
      card.style.position = 'relative';
      card.appendChild(editBtn);
    }
    editBtn.replaceWith(editBtn.cloneNode(true));
    editBtn = card.querySelector('.edit-card-btn');
    editBtn.onclick = (e) => { e.stopPropagation(); startSkillCardEdit(card); };
  });
}

function startCardEdit(card) {
  if (card.classList.contains('editing')) return;
  card.classList.add('editing');
  const desc = card.querySelector('.card-desc');
  const achievements = card.querySelector('.achievements');
  
  if (desc) {
    desc.contentEditable = 'true';
    desc.style.cssText += 'outline:2px dashed var(--primary);outline-offset:4px;background:rgba(37,99,235,0.05);border-radius:8px;padding:8px;';
  }
  if (achievements) {
    achievements.querySelectorAll('li').forEach(li => {
      li.contentEditable = 'true';
      li.style.cssText += 'outline:1px dashed rgba(37,99,235,0.4);outline-offset:2px;background:rgba(37,99,235,0.03);border-radius:4px;margin:2px 0;';
    });
  }
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn';
  saveBtn.style.cssText = 'background:#059669;color:white;margin-top:1rem;padding:8px 20px;border-radius:50px;font-size:0.82rem;border:none;cursor:pointer;';
  saveBtn.innerHTML = '<i class="fas fa-check" style="margin-right:4px;"></i>保存修改';
  saveBtn.onclick = async () => {
    if (desc) { desc.contentEditable = 'false'; desc.style.outline = ''; desc.style.background = ''; }
    if (achievements) { achievements.querySelectorAll('li').forEach(li => { li.contentEditable = 'false'; li.style.outline = ''; li.style.background = ''; }); }
    saveBtn.remove();
    card.classList.remove('editing');
    showToast('⏳ 正在保存修改...');
    cleanRuntimeDOM();
    const finalHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    await uploadToServerRaw('index.html', finalHtml, 'Update experience content via admin');
    // 重新注入运行时 DOM
    applyAdminMode();
  };
  card.appendChild(saveBtn);
}

function startSkillCardEdit(card) {
  if (card.classList.contains('editing')) return;
  card.classList.add('editing');
  const title = card.querySelector('h3');
  const desc = card.querySelector('p');
  if (title) {
    title.contentEditable = 'true';
    title.style.cssText += 'outline:2px dashed var(--primary);outline-offset:4px;background:rgba(37,99,235,0.05);border-radius:8px;padding:4px 8px;';
  }
  if (desc) {
    desc.contentEditable = 'true';
    desc.style.cssText += 'outline:2px dashed var(--primary);outline-offset:4px;background:rgba(37,99,235,0.05);border-radius:8px;padding:8px;';
  }
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn';
  saveBtn.style.cssText = 'background:#059669;color:white;margin-top:1rem;padding:8px 20px;border-radius:50px;font-size:0.82rem;border:none;cursor:pointer;';
  saveBtn.innerHTML = '<i class="fas fa-check" style="margin-right:4px;"></i>保存修改';
  saveBtn.onclick = async () => {
    if (title) { title.contentEditable = 'false'; title.style.outline = ''; title.style.background = ''; }
    if (desc) { desc.contentEditable = 'false'; desc.style.outline = ''; desc.style.background = ''; }
    saveBtn.remove();
    card.classList.remove('editing');
    showToast('⏳ 正在保存修改...');
    cleanRuntimeDOM();
    const finalHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    await uploadToServerRaw('index.html', finalHtml, 'Update skills content via admin');
    applyAdminMode();
  };
  card.appendChild(saveBtn);
}


