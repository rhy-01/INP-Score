function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const text = document.getElementById('theme-text');
  text.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

async function queryScore() {
  const studentId = document.getElementById('studentId').value.trim();
  const studentName = document.getElementById('studentName').value.trim();
  const alertContainer = document.getElementById('alert-container');

  alertContainer.innerHTML = '';

  if (!studentId || !studentName) {
    showAlert('請輸入學號和姓名', 'error');
    return;
  }

  document.getElementById('querySection').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
  document.getElementById('result-section').style.display = 'none';

  document.body.classList.add('loading-active');

  try {
    const apiUrl = 'https://script.google.com/macros/s/AKfycbwyVqfpNIPE1E_EXds2zk4veSHOnq-PMYm4TtfI3e1hC_PMCUu3fYu5SjJ3g0B7RESdJg/exec' +
                   `?api=getScore&studentId=${encodeURIComponent(studentId)}&studentName=${encodeURIComponent(studentName)}`;

    const response = await fetch(apiUrl);
    const result = await response.json();

    document.getElementById('loading').style.display = 'none';
    document.body.classList.remove('loading-active');

    if (result.success) {
      const now = new Date();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      const dateStr = now.toLocaleString('en-US', options) + ' GMT+8';
      document.getElementById('scoreDate').textContent = dateStr;

      document.getElementById('displayStudentId').textContent = result.studentId;
      document.getElementById('displayName').textContent = result.name;
      document.getElementById('displayDepartment').textContent = result.department;

      document.getElementById('hw1Score').textContent = result.hw1;
      document.getElementById('hw2Score').textContent = result.hw2;
      document.getElementById('hw3Score').textContent = result.hw3;
      document.getElementById('totalScore').textContent = result.totalScore;

      document.getElementById('result-section').style.display = 'block';
    } else {
      document.getElementById('querySection').style.display = 'block';
      showAlert(result.message, 'error');
    }
  } catch (error) {
    console.error('查詢錯誤:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('querySection').style.display = 'block';
    document.body.classList.remove('loading-active');
    showAlert('系統錯誤，請稍後再試', 'error');
  }
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  const alertClass = type === 'error' ? 'alert-error' : 'alert-success';
  alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}

function backToLogin() {
  document.getElementById('result-section').style.display = 'none';
  document.getElementById('querySection').style.display = 'block';
  document.getElementById('studentId').value = '';
  document.getElementById('studentName').value = '';
}

document.addEventListener('DOMContentLoaded', function() {
  initTheme();

  document.getElementById('studentId').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') queryScore();
  });
  document.getElementById('studentName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') queryScore();
  });

  // Scroll detection for hiding/showing top buttons
  const topButtons = document.querySelector('.top-buttons');
  const resultSection = document.getElementById('result-section');

  window.addEventListener('scroll', function() {
    // Only apply scroll behavior when result section is visible
    if (resultSection.style.display !== 'block') return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? 20 : 50; // Lower threshold for mobile

    if (scrollTop > threshold) {
      // Scrolling down & past threshold - hide buttons
      topButtons.classList.add('hidden');
    } else {
      // At the top (within threshold) - show buttons
      topButtons.classList.remove('hidden');
    }
  });
});
