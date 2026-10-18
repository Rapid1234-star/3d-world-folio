import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export const S = {};
export async function installContent(S) {
S.LINKS = {
  github: 'https://github.com/Rapid1234-star',
  linkedin: 'https://www.linkedin.com/in/aayan-desai/',
  email: 'aayanirshad99@gmail.com',
  phone: '+971 56-123-5034',
  googleCert: 'https://www.coursera.org/account/accomplishments/professional-cert/BC7C1BZCZ780',
  metaCert: 'https://www.coursera.org/account/accomplishments/professional-cert/L9U93KKVJ6D4',
  microsoftCert: 'https://www.coursera.org/account/accomplishments/professional-cert/T20FSGC6EJ4T',
};
S.SCAM = {
  SAFE: { line: '“Running late, same café as last week. No links, no codes.”', note: 'Known caller, no credential ask, no link. The classifier leaves it alone.' },
  SUSPICIOUS: { line: '“Your parcel is held. Open the link in the next two minutes or it returns.”', note: 'Time pressure plus an off-channel link. Not enough to call it a confirmed scam, enough to refuse.' },
  SCAM: { line: '“This is your bank. Read me the code we just texted or the account locks.”', note: 'Asks for a one-time code. Legitimate banks do not collect OTPs by phone.' },
};
S.STANDS = [
  { id: 'about', kind: 'about', stamp: 'A', angle: -108, title: 'About', short: 'About', badge: 'ABOUT', kicker: 'Home', section: 'about', color: '#cdb8f0',
    h: 'Aayan Irshad Desai',
    lede: ['QA Automation Engineer | Full-Stack Developer.', 'Al Nahda, Sharjah, UAE.'],
    copy: ['Cybersecurity-focused Computer Science student and QA automation engineer. I build large Playwright suites, production web systems, and AI-driven automation pipelines.',
      'The work sits between secure application development and shipping: authentication workarounds, endpoint remediation at scale, and full-stack apps from React and Node to Python computer vision.'],
    meta: [['Focus', 'Cybersecurity · QA · Full-stack'], ['Based', 'Sharjah, UAE'], ['Now', 'BCS, University of Wollongong in Dubai'], ['Board', 'The greenhouse']],
    links: [['GitHub', S.LINKS.github], ['LinkedIn', S.LINKS.linkedin], ['Email', 'mailto:' + S.LINKS.email]],
    cta: ['GitHub', S.LINKS.github], line: 'QA · full-stack · cybersecurity' },
  { id: 'education', kind: 'education', stamp: 'E', angle: -72, title: 'Education', short: 'Education', badge: 'EDUCATION', kicker: 'University', section: 'uowd', color: '#ffe08f',
    h: 'University of Wollongong in Dubai',
    lede: ['Bachelor of Computer Science, Cybersecurity.', 'April 2025 – April 2028 · Dubai, UAE.'],
    boardLines: ['BCS Cybersecurity, 2025–2028', 'Google Cybersecurity', 'Meta Front-End Developer', 'Microsoft Python Development'],
    copy: ['The degree is this stand. The three professional certificates are listed on the card, each with its Coursera credential.'],
    blocks: [
      { h: 'Degree', items: ['Bachelor of Computer Science, specializing in Cybersecurity.'] },
      { h: 'Certificates', items: ['Google Cybersecurity Professional Certificate', 'Meta Front-End Developer Professional Certificate', 'Microsoft Python Development Professional Certificate'] },
    ],
    links: [['Google certificate', S.LINKS.googleCert], ['Meta certificate', S.LINKS.metaCert], ['Microsoft certificate', S.LINKS.microsoftCert]],
    cta: ['Google certificate', S.LINKS.googleCert], line: 'BCS Cybersecurity · 2025–2028' },
  { id: 'skills', kind: 'skills', stamp: 'S', angle: -36, title: 'Skills', short: 'Skills', badge: 'SKILLS', kicker: 'The lab', section: 'skills', color: '#a9d4f2',
    h: 'Skills',
    lede: ['Four benches. One inventory.', 'Security is a skill group, not its own district.'],
    copy: ['Languages, frameworks, QA, and systems. The same list a recruiter would scan on the PDF.'],
    blocks: [
      { h: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL'] },
      { h: 'Frameworks & tools', items: ['React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Playwright', 'OpenCV', 'Git/GitHub', 'n8n', 'Azure Bastion', 'Wix'] },
      { h: 'QA & automation', items: ['Test case design', 'Test automation', 'Regression and production testing', 'Defect tracking', 'Test reporting'] },
      { h: 'Systems & security', items: ['Windows Registry and Services', 'Endpoint remediation', 'Cybersecurity fundamentals', 'Agile workflows'] },
    ],
    cta: ['GitHub', S.LINKS.github], line: 'Python · React · Playwright' },
  { id: 'patchifi', kind: 'experience', stamp: 'P', angle: 0, title: 'Patchifi', short: 'Patchifi', badge: 'EXPERIENCE', kicker: 'Company · Patchifi', section: 'experience', color: '#ffc4a3',
    h: 'Patchifi',
    lede: ['QA & Automation Intern.', 'Apr 2026 – Sept 2026 · Remote.'],
    highlights: ['840+ Playwright tests across 8 modules', 'One OTP session reused by 800+ tests', '22 endpoint scripts checked on Azure Bastion'],
    copy: ['A cybersecurity and patch-management company. This shop is one door on the Experience row. The next company stands beside it.'],
    blocks: [
      { h: 'Test engineering', items: [
        'Built and maintained 840+ automated Playwright test cases across 8 core modules: Dashboard, Access Control, Patch Center, and the rest of the platform.',
        'Engineered an OTP-polling and session-reuse workflow so 800+ tests run under one authenticated session.',
      ] },
      { h: 'Automation and systems', items: [
        'Designed an n8n + AI pipeline that auto-publishes company blog content to LinkedIn, then pitched 10 more automation opportunities to the CEO.',
        'Validated 22 endpoint remediation scripts (14 disable-update, 8 update) for Chrome, Edge, Firefox, and Dropbox via Azure Bastion.',
        'Led a desktop and mobile QA audit of the production Wix site, logged defects, fixed UI issues, and configured email-gated download forms.',
      ] },
    ],
    meta: [['Tools', 'Playwright, JavaScript/TypeScript, n8n, Wix, Azure Bastion']],
    cta: ['LinkedIn', S.LINKS.linkedin], line: 'QA intern · Apr–Sept 2026' },
  { id: 'appify', kind: 'experience', stamp: 'B', angle: 36, title: 'Appify Brands', short: 'Appify', badge: 'EXPERIENCE', kicker: 'Company · Appify Brands', section: 'experience', color: '#ffc4a3',
    h: 'Appify Brands',
    lede: ['Web Developer · freelance.', 'Sept 2026 · Remote.'],
    highlights: ['Two production landing pages', 'React, Next.js, and Three.js', 'Motion with Framer Motion and GSAP'],
    copy: ['The second shop on the Experience row. Different work from Patchifi: shipping interfaces, not a test suite.'],
    blocks: [
      { h: 'Landing pages', items: [
        'Designed and developed 2 premium responsive landing pages with React, Next.js, and Three.js.',
        'Motion with Framer Motion and GSAP. Partnered with Appify Brands to refine, test, and publish both to production.',
      ] },
    ],
    meta: [['Tools', 'React, Next.js, TypeScript, Three.js, Framer Motion, GSAP, Tailwind']],
    cta: ['LinkedIn', S.LINKS.linkedin], line: 'Web developer · Sept 2026' },
  { id: 'projects', kind: 'project', stamp: 'R', angle: 72, title: 'Projects', short: 'Projects', badge: 'PROJECT', kicker: 'Five builds', section: 'projects', color: '#a9dcb6',
    h: 'Projects',
    lede: ['Five builds. Not company doors.', 'Experience stays on the two peach shops.'],
    copy: ['Each one is a project. Voice Scam Shield includes a short Safe / Suspicious / Scam demo. It does not use the microphone.'],
    blocks: [
      { h: '01 · Internship Management System', s: 'Node.js, HTML, CSS, JavaScript', href: 'https://github.com/Rapid1234-star/Internship-management-site', items: ['Full-stack portal with role-based access, secure authentication, and queries tuned for applications and placements.'] },
      { h: '02 · AI Resume Analyzer', s: 'TypeScript, JavaScript, AI', href: 'https://github.com/Rapid1234-star/ai-resume-analyser', items: ['Parses, evaluates, and scores resume content. The scoring pass landed about a 30% accuracy gain.'] },
      { h: '03 · Voice Scam Shield', s: 'TypeScript, JavaScript, AI', href: 'https://github.com/Rapid1234-star/Voice_Scam_Shield', items: ['A prototype that scores a call as Safe, Suspicious, or Scam. These three scripted lines show the decision.'], scam: true },
      { h: '04 · AI Face & Object Detection', s: 'Python, OpenCV, COCO-SSD', href: 'https://github.com/Rapid1234-star/AI-Object-Detection', items: ['Facial recognition with about a 20% accuracy improvement, plus a browser object detector on COCO-SSD.'] },
      { h: '05 · Hand Snake', s: 'React, TypeScript, MediaPipe, Python', href: 'https://github.com/Rapid1234-star/Gesture-Snake-game', items: ['A browser snake you steer with your hand. MediaPipe on the front, a Python reference engine beside it.'] },
    ],
    links: [['GitHub', S.LINKS.github]],
    cta: ['GitHub', S.LINKS.github], line: 'Five builds · one gallery' },
  { id: 'contact', kind: 'contact', stamp: 'C', angle: 108, title: 'Say hello', short: 'Contact', badge: 'CONTACT', kicker: 'Connect', section: 'contact', color: '#f6b3c7',
    h: 'Say hello',
    lede: ['GitHub, LinkedIn, or a straight email.', 'Al Nahda, Sharjah.'],
    copy: ['The sign and this card use the same three links.'],
    meta: [['Email', S.LINKS.email], ['Phone', S.LINKS.phone], ['GitHub', 'Rapid1234-star'], ['LinkedIn', 'aayan-desai']],
    links: [['Email', 'mailto:' + S.LINKS.email], ['GitHub', S.LINKS.github], ['LinkedIn', S.LINKS.linkedin]],
    email: S.LINKS.email, cta: ['Write an email', 'mailto:' + S.LINKS.email] },
];

S.$ = id => document.getElementById(id);
S.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (S.isTouch) {
  document.documentElement.classList.add('touch');
  const st = document.querySelector('#start b .word'); if (st) st.textContent = 'Tap';
  const sm = document.querySelector('#start small'); if (sm) sm.textContent = 'then steer with the stick';
}
S.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
S.phone = () => innerWidth < 641;
S.DEG = Math.PI / 180;
S.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
S.damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
S.expoOut = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
function rngFromSeed(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
S.rand = rngFromSeed(20261009);
S.R = (a, b) => a + S.rand() * (b - a);
S.polar = (aDeg, r) => new THREE.Vector3(Math.sin(aDeg * S.DEG) * r, 0, -Math.cos(aDeg * S.DEG) * r);
S.faceY = (p, w = 1.1) => { const l = Math.hypot(p.x, p.z); const dx = -p.x / l + Math.sin(22 * S.DEG) * w, dz = -p.z / l + Math.cos(22 * S.DEG) * w; return Math.atan2(dx, dz); };

function renderList(ol, onPick) {
  ol.innerHTML = '';
  S.STANDS.forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.style.setProperty('--c', s.color);
    const name = s.short || s.title;
    const sub = s.lede[0];
    b.innerHTML = `<span class="sw"></span><span><strong>${name}</strong><em>${sub}</em></span><span class="go mono">${onPick ? 'Open' : ''}</span>`;
    if (onPick) b.addEventListener('click', () => onPick(s)); else b.disabled = true;
    li.appendChild(b); ol.appendChild(li);
  });
}

function parkFallback() { document.documentElement.classList.add('nogl'); S.$('loader').classList.add('out'); }
if (document.documentElement.classList.contains('nogl')) { parkFallback(); await new Promise(() => {}); } // stop here quietly
S.rngFromSeed = rngFromSeed;
S.renderList = renderList;
S.parkFallback = parkFallback;

}
