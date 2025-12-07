
// Select all indicator elements on the page
const indicators = document.querySelectorAll('.indicator');

// Loop through each indicator element and set up event listeners and default active tab
indicators.forEach(indicator => {
  const tabs = indicator.parentElement.querySelectorAll('.nav-inline .nav-link');

  function handleIndicator(el) {
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });
    el.classList.add('active');
    indicator.style.width = `${el.offsetWidth}px`;
    indicator.style.left = `${el.offsetLeft}px`;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      handleIndicator(e.target);
    });
  });

  // Show indicator on default active tab when page loads
  const defaultActiveTab = indicator.parentElement.querySelector('.nav-inline .nav-link.active');
  if (defaultActiveTab) {
    handleIndicator(defaultActiveTab);
  }

  window.addEventListener('resize', () => {
    const activeTab = indicator.parentElement.querySelector('.nav-inline .nav-link.active');
    handleIndicator(activeTab);
  });
});




const navBars = document.querySelectorAll('.nav-inline');

navBars.forEach(navBar => {
  const navLinks = navBar.querySelectorAll('.nav-link');
  let activeNavLink;

  navLinks.forEach(navLink => {
    if (navLink.classList.contains('active')) {
      activeNavLink = navLink;
    }

    navLink.addEventListener('click', e => {
      e.preventDefault();
      scrollToNavLink(navLink);
    });
  });

  window.addEventListener('resize', e => {
    if (activeNavLink) {
      const navLinkRect = activeNavLink.getBoundingClientRect();
      const navBarRect = navBar.getBoundingClientRect();

      // Calculate the new scroll position of the nav bar
      const newScrollPosition = navBar.scrollLeft + navLinkRect.left - navBarRect.left;

      // Check if the new scroll position is outside the visible area
      if (newScrollPosition < navBar.scrollLeft || newScrollPosition + navLinkRect.width > navBar.scrollLeft + navBarRect.width) {
        // Scroll the nav bar to the new position
        navBar.scrollTo({
          left: newScrollPosition,
          behavior: 'smooth'
        });
      }
    }
  });

  function scrollToNavLink(navLink) {
    const navLinkRect = navLink.getBoundingClientRect();
    const navBarRect = navBar.getBoundingClientRect();

    // Calculate the new scroll position of the nav bar
    const newScrollPosition = navBar.scrollLeft + navLinkRect.left - navBarRect.left;

    // Check if the new scroll position is outside the visible area
    if (newScrollPosition < navBar.scrollLeft || newScrollPosition + navLinkRect.width > navBar.scrollLeft + navBarRect.width) {
      // Scroll the nav bar to the new position
      navBar.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
    activeNavLink = navLink;
  }
});


/**Vertical nav */
const indicatorsV = document.querySelectorAll('.indicator-vertical');

// Loop through each indicator element and set up event listeners and default active tab
indicatorsV.forEach(indicatorV => {
  const tabsV = indicatorV.parentElement.querySelectorAll('.nav-vertical .nav-link');

  function handleIndicator(el) {
    tabsV.forEach(tabV => {
      tabV.classList.remove('active');
    });
    el.classList.add('active');
    indicatorV.style.height = `${el.offsetHeight}px`;
    indicatorV.style.top = `${el.offsetTop}px`;
  }

  tabsV.forEach(tabV => {
    tabV.addEventListener('click', e => {
      handleIndicator(e.target);
    });
  });

  // Show indicator on default active tab when page loads
  const defaultActiveTabV = indicatorV.parentElement.querySelector('.nav-vertical .nav-link.active');
  if (defaultActiveTabV) {
    handleIndicator(defaultActiveTabV);
  }

  window.addEventListener('resize', () => {
    const activeTabV = indicatorV.parentElement.querySelector('.nav-vertical .nav-link.active');
    handleIndicator(activeTabV);
  });
});
