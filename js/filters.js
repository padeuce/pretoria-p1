export function initialiseFixtureFilters(initialFixtures, render) {
  let fixtures = initialFixtures;
  const state = { court: "all", division: "all" };
  const applyFilters = () => {
    render(fixtures.filter(item =>
      (state.court === "all" || item.court === state.court) &&
      (state.division === "all" || item.division === state.division)
    ));
  };

  document.querySelectorAll("[data-filter-group]").forEach(group => {
    group.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      group.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      state[group.dataset.filterGroup] = button.dataset.value;
      applyFilters();
    });
  });

  return {
    update(nextFixtures) {
      fixtures = nextFixtures;
      applyFilters();
    }
  };
}
