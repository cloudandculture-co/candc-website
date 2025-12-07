/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2022 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
  'use strict'

  const storedTheme = localStorage.getItem('theme')

  const getPreferredTheme = () => {
    if (storedTheme) {
      return storedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = function (theme) {
    if (theme === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-bs-theme', 'dark')
      } else {
        document.documentElement.setAttribute('data-bs-theme', 'light')
      }
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  const showActiveTheme = (theme, suppressInitialIcon = false) => {
    const activeThemeIcon = document.querySelector('.theme-icon-active .material-icons')
    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    
    if (!btnToActive) {
      console.warn(`Theme button with value "${theme}" not found`)
      return
    }
    
    const iconOfActiveBtn = btnToActive.querySelector('.theme-icon .material-icons')
    
    if (!iconOfActiveBtn) {
      console.warn(`Theme icon not found for "${theme}"`)
      return
    }
    
    const iconName = iconOfActiveBtn.textContent.trim()

    // Remove active class from all theme buttons
    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active')
    })

    // Add active class to the selected theme button
    btnToActive.classList.add('active')
    
    // Update the main theme icon if it exists
    if (activeThemeIcon && !suppressInitialIcon) {
      activeThemeIcon.textContent = iconName
    }
  }

  // Set initial theme
  setTheme(getPreferredTheme())

  // Handle system theme changes for auto mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentStoredTheme = localStorage.getItem('theme')
    if (!currentStoredTheme || currentStoredTheme === 'auto') {
      setTheme(getPreferredTheme())
    }
  })

  // Initialize when DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    // Show active theme and set initial icon
    const currentTheme = getPreferredTheme()
    showActiveTheme(currentTheme)
    
    // Set the initial icon in the dropdown trigger
    const activeThemeIcon = document.querySelector('.theme-icon-active .material-icons')
    const btnToActive = document.querySelector(`[data-bs-theme-value="${currentTheme}"]`)
    
    if (activeThemeIcon && btnToActive) {
      const iconOfActiveBtn = btnToActive.querySelector('.theme-icon .material-icons')
      if (iconOfActiveBtn) {
        activeThemeIcon.textContent = iconOfActiveBtn.textContent.trim()
      }
    }

    // Add click event listeners to theme buttons
    document.querySelectorAll('[data-bs-theme-value]').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault()
        const theme = toggle.getAttribute('data-bs-theme-value')
        localStorage.setItem('theme', theme)
        setTheme(theme)
        showActiveTheme(theme)
      })
    })
  })
})()