export function initialiseFixtureFilters(fixtures, render) {
  const state = { court: "all", division: "all" };
  document.querySelectorAll("[data-filter-group]").forEach(group => {
    group.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      group.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      state[group.dataset.filterGroup] = button.dataset.value;
      render(fixtures.filter(item => (state.court === "all" || item.court === state.court) && (state.division === "all" || item.division === state.division)));
    });
  });
}
