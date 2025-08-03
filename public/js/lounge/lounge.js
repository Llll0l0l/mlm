document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelector("nav ul");
  const tabsArray = document.querySelectorAll("nav ul li");
  // sections
  // const sections = document.querySelector("main");
  const sectionsArray = document.querySelectorAll(".section");

  // check if there is a saved tab
  if (localStorage.getItem("selectedTabData")) {
    // remove the previous active tab and section
    document.querySelector("[data-tab=home]").classList.remove("tab-active");
    document.querySelector("[data-section=home]").classList.remove("active");

    // add active to the selected tab and section
    document
      .querySelector(`[data-tab=${localStorage.getItem("selectedTabData")}]`)
      .classList.add("tab-active");
    document
      .querySelector(
        `[data-section=${localStorage.getItem("selectedTabData")}]`
      )
      .classList.add("active");
  }

  //   add event listener to each of the tabs
  tabs.addEventListener("click", (e) => {
    const selectedTab = e.target.closest("li");
    if (!selectedTab || !tabs.contains(selectedTab)) return;

    const selectedSection = document.querySelector(
      `[data-section=${selectedTab.dataset.tab}]`
    );

    if (!selectedSection) return;
    tabsArray.forEach((tab) => {
      tab.classList.remove("tab-active");
    });
    sectionsArray.forEach((section) => {
      section.classList.remove("active");
    });
    selectedTab.classList.add("tab-active");
    selectedSection.classList.add("active");
    localStorage.setItem("selectedTabData", selectedTab.dataset.tab);
  });
});
