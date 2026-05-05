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

  // 恢复已保存简历（优先从 GitHub 文件读取）
  const savedResume = localStorage.getItem('resumePDF');
  if (savedResume) {
    updateResumeUI(savedResume);
  } else {
    // 尝试从 GitHub Pages 加载简历
    fetch('resume/赵龙杰-简历.pdf').then(r => {
      if (r.ok) {
        const blob = r.blob();
        blob.then(b => {
          const reader = new FileReader();
          reader.onload = e => {
            localStorage.setItem('resumePDF', e.target.result);
            updateResumeUI(e.target.result);
          };
          reader.readAsDataURL(b);
        });
      }
    }).catch(() => {});
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
// ===== File Upload via local server (auto git push via SSH) =====
async function uploadToServer(filepath, base64Content, commitMsg) {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filepath, content: base64Content, message: commitMsg })
    });
    const result = await response.json();
    if (result.ok) {
      showToast(`✅ ${result.msg}`);
      return true;
    } else {
      showToast(`❌ 上传失败：${result.error || '未知错误'}`);
      return false;
    }
  } catch(e) {
    showToast('❌ 无法连接本地服务器，请确保 server.py 正在运行');
    return false;
  }
}

// Legacy: kept for compatibility
async function uploadToGitHub(filename, base64Content, commitMsg) {
  return uploadToServer(`photos/${filename}`, base64Content, commitMsg);
}

// ===== Load gallery photos from GitHub Pages =====
async function loadGalleryPhotos() {
  // 尝试直接从 GitHub Pages 的 photos 目录加载图片
  try {
    // 通过 GitHub API 获取文件列表（公开仓库无需 Token）
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/photos?ref=${GITHUB_BRANCH}`);
    if (!res.ok) return;
    const files = await res.json();
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name) && f.name !== '.gitkeep');
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

const resumeUpload = document.getElementById('resumeUpload');
if (resumeUpload) {
  resumeUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      const base64 = dataUrl.split(',')[1];
      const ok = await uploadToServer('resume/赵龙杰-简历.pdf', base64, 'Add resume PDF');
      if (ok) {
        localStorage.setItem('resumePDF', dataUrl);
        updateResumeUI(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
}

// ===== Delete file via local server =====
async function deleteFromServer(filepath, commitMsg) {
  try {
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filepath, message: commitMsg })
    });
    const result = await response.json();
    if (result.ok) {
      showToast(`✅ ${result.msg}`);
      return true;
    } else {
      showToast(`❌ 删除失败：${result.error || '未知错误'}`);
      return false;
    }
  } catch(e) {
    showToast('❌ 无法连接本地服务器');
    return false;
  }
}

// ===== Delete Resume =====
function addResumeDeleteBtn() {
  const resumeSection = document.getElementById('resumeSection');
  if (!resumeSection || document.getElementById('resumeDeleteBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'resumeDeleteBtn';
  btn.className = 'btn';
  btn.style.cssText = 'background:#dc2626;color:white;padding:8px 18px;border-radius:50px;font-size:0.82rem;cursor:pointer;border:none;box-shadow:0 4px 12px rgba(220,38,38,0.3);margin-left:0.5rem;';
  btn.innerHTML = '<i class="fas fa-trash" style="margin-right:4px;"></i>删除简历';
  btn.onclick = async () => {
    if (!confirm('确定要删除简历吗？')) return;
    const ok = await deleteFromServer('resume/赵龙杰-简历.pdf', 'Delete resume PDF');
    if (ok) {
      localStorage.removeItem('resumePDF');
      document.getElementById('resumeSection').style.display = 'none';
      document.getElementById('resumeEmpty').style.display = '';
      document.getElementById('heroBtnResume').style.display = 'none';
      btn.remove();
    }
  };
  resumeSection.appendChild(btn);
}

// ===== Photo Delete Buttons (admin only) =====
function addPhotoDeleteBtns() {
  document.querySelectorAll('.photo-item[data-github-file]').forEach(item => {
    if (item.querySelector('.photo-delete-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'photo-delete-btn';
    btn.style.cssText = 'position:absolute;top:8px;right:8px;background:rgba(220,38,38,0.85);color:white;border:none;border-radius:50%;width:28px;height:28px;font-size:0.75rem;cursor:pointer;z-index:10;display:none;align-items:center;justify-content:center;transition:opacity 0.2s;';
    btn.innerHTML = '<i class="fas fa-times"></i>';
    const filename = item.getAttribute('data-github-file');
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm('确定要删除这张照片吗？')) return;
      const ok = await deleteFromServer(`photos/${filename}`, `Delete photo: ${filename}`);
      if (ok) {
        item.remove();
        // 如果没有照片了，显示占位符
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
    item.addEventListener('mouseenter', () => { if (isAdmin) btn.style.display = 'flex'; });
    item.addEventListener('mouseleave', () => { btn.style.display = 'none'; });
  });
}

// ===== Experience Inline Edit (admin mode) =====
function enableExperienceEdit() {
  document.querySelectorAll('.timeline-card').forEach(card => {
    if (card.querySelector('.edit-card-btn')) return;
    // 添加编辑按钮
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-card-btn';
    editBtn.style.cssText = 'position:absolute;top:12px;right:12px;background:var(--primary);color:white;border:none;border-radius:50%;width:30px;height:30px;font-size:0.78rem;cursor:pointer;z-index:5;display:none;align-items:center;justify-content:center;';
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      makeCardEditable(card);
    };
    card.style.position = 'relative';
    card.appendChild(editBtn);
    card.addEventListener('mouseenter', () => { if (isAdmin) editBtn.style.display = 'flex'; });
    card.addEventListener('mouseleave', () => { editBtn.style.display = 'none'; });
  });
}

function makeCardEditable(card) {
  if (card.classList.contains('editing')) return;
  card.classList.add('editing');
  
  // 让 card-desc 和 achievements 里的文本可编辑
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
  
  // 添加保存按钮
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn';
  saveBtn.style.cssText = 'background:#059669;color:white;margin-top:1rem;padding:8px 20px;border-radius:50px;font-size:0.82rem;border:none;cursor:pointer;';
  saveBtn.innerHTML = '<i class="fas fa-check" style="margin-right:4px;"></i>保存修改';
  saveBtn.onclick = async () => {
    // 取消可编辑状态
    if (desc) {
      desc.contentEditable = 'false';
      desc.style.outline = '';
      desc.style.background = '';
    }
    if (achievements) {
      achievements.querySelectorAll('li').forEach(li => {
        li.contentEditable = 'false';
        li.style.outline = '';
        li.style.background = '';
      });
    }
    saveBtn.remove();
    card.classList.remove('editing');
    
    // 更新 index.html 并 git push
    const htmlContent = document.documentElement.outerHTML;
    const fullHtml = '<!DOCTYPE html>\n<html' + htmlContent.substring(htmlContent.indexOf('<html') + 5);
    // Actually, better to get the full HTML properly
    const doctype = '<!DOCTYPE html>\n';
    const finalHtml = doctype + document.documentElement.outerHTML;
    const encoder = new TextEncoder();
    const base64 = btoa(unescape(encodeURIComponent(finalHtml)));
    
    showToast('⏳ 正在保存修改...');
    const ok = await uploadToServer('__update_content__', base64, 'Update experience content via admin');
    if (ok) {
      // Need special handling - use update-content API
    }
  };
  card.appendChild(saveBtn);
}

// Override uploadToServer to handle content updates
const _originalUploadToServer = uploadToServer;
async function uploadToServer(filepath, base64Content, commitMsg) {
  if (filepath === '__update_content__') {
    // Use the update-content API
    try {
      // Decode base64 back to string
      const decoded = decodeURIComponent(escape(atob(base64Content)));
      const response = await fetch('/api/update-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: decoded, message: commitMsg })
      });
      const result = await response.json();
      if (result.ok) {
        showToast(`✅ ${result.msg}`);
        return true;
      } else {
        showToast(`❌ 保存失败：${result.error || '未知错误'}`);
        return false;
      }
    } catch(e) {
      showToast('❌ 无法连接本地服务器');
      return false;
    }
  }
  return _originalUploadToServer(filepath, base64Content, commitMsg);
}

// ===== Apply admin features on mode change =====
const _originalApplyAdminMode = applyAdminMode;
function applyAdminMode() {
  _originalApplyAdminMode();
  if (isAdmin) {
    addResumeDeleteBtn();
    addPhotoDeleteBtns();
    enableExperienceEdit();
  }
}

