// Nexus Game Portal - Universal Theme Switcher (Light / Dark Mode)
(function () {
  const savedTheme = localStorage.getItem('nexus_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  window.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      updateBtnLabel(toggleBtn, savedTheme);

      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('nexus_theme', newTheme);
        updateBtnLabel(toggleBtn, newTheme);
      });
    }
  });

  function updateBtnLabel(btn, theme) {
    btn.innerHTML = theme === 'dark' ? '☀️ LIGHT MODE' : '🌙 DARK MODE';
  }
})();
