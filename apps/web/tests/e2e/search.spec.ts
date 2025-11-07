import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test("displays search results from SSR with query params", async ({ page }) => {
    await page.goto("/search?q=Sydney&beds=2");

    // Check page title/heading
    const pageHeading = page.getByRole("heading", {
      name: "Search Properties",
      level: 1,
    });
    await expect(pageHeading).toBeVisible();

    // Wait for results to load
    await page.waitForLoadState("networkidle");

    // Check for results status (either count or empty state)
    const resultsStatus = page.getByRole("status", { name: /showing|no properties found/i });
    await expect(resultsStatus).toBeVisible();

    const emptyState = page.getByText(
      "No properties match your search criteria. Try adjusting your filters."
    );
    const listingCards = page.locator('[href^="/listing/"]').filter({
      has: page.locator("img"),
    });

    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const listingCount = await listingCards.count();

    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
    } else {
      // If results exist, should have listing cards in a grid
      expect(listingCount).toBeGreaterThan(0);
    }
  });

  test("filter inputs update URL and refresh results", async ({ page }) => {
    await page.goto("/search?q=Sydney&beds=2");

    // Wait for initial load
    await page.waitForLoadState("networkidle");

    // Find beds filter input
    const bedsInput = page.getByLabel(/bedrooms?/i);
    await expect(bedsInput).toBeVisible();

    // Clear and update beds value
    await bedsInput.clear();
    await bedsInput.fill("3");
    await bedsInput.blur(); // Trigger change event

    // Wait for URL to update (debounced, may take a moment)
    await page.waitForURL(/beds=3/, { timeout: 2000 }).catch(() => {
      // If URL doesn't update immediately, check if it updates after navigation
    });

    // Verify URL contains beds=3
    const currentURL = page.url();
    expect(currentURL).toContain("beds=3");
    expect(currentURL).not.toContain("beds=2");

    // Wait for page refresh/rerender
    await page.waitForLoadState("networkidle");

    // Results should refresh (status should be visible)
    const resultsStatus = page.getByRole("status");
    await expect(resultsStatus).toBeVisible();
  });

  test("toggles between list and map view", async ({ page }) => {
    await page.goto("/search?q=Sydney&beds=2");

    // Wait for initial load
    await page.waitForLoadState("networkidle");

    // Find MapToggle buttons
    const listButton = page.getByRole("button", { name: "List" });
    const mapButton = page.getByRole("button", { name: "Map" });

    await expect(listButton).toBeVisible();
    await expect(mapButton).toBeVisible();

    // Initially should be in list view (List button pressed)
    await expect(listButton).toHaveAttribute("aria-pressed", "true");
    await expect(mapButton).toHaveAttribute("aria-pressed", "false");

    // Verify list view shows listing cards grid
    const listingCards = page.locator('[href^="/listing/"]');
    const initialCardCount = await listingCards.count();
    // Note: might be 0 if no results, but the structure should be there

    // Click Map button to switch to map view
    await mapButton.click();

    // Wait for navigation/refresh
    await page.waitForLoadState("networkidle");

    // URL should contain map=true
    await expect(page).toHaveURL(/map=true/);

    // Map button should be pressed now
    await expect(mapButton).toHaveAttribute("aria-pressed", "true");
    await expect(listButton).toHaveAttribute("aria-pressed", "false");

    // Map container should be visible
    const mapContainer = page.locator('[role="application"][aria-label="Property map"]');
    await expect(mapContainer).toBeVisible();

    // Wait a bit for map to initialize (Mapbox loads asynchronously)
    await page.waitForTimeout(1000);

    // Verify map container has height/width (actually rendered)
    const mapBox = await mapContainer.boundingBox();
    expect(mapBox).not.toBeNull();
    if (mapBox) {
      expect(mapBox.height).toBeGreaterThan(0);
      expect(mapBox.width).toBeGreaterThan(0);
    }

    // Switch back to list view
    await listButton.click();
    await page.waitForLoadState("networkidle");

    // URL should no longer have map=true (or map param removed)
    const finalURL = page.url();
    expect(finalURL).not.toContain("map=true");

    // List button should be pressed
    await expect(listButton).toHaveAttribute("aria-pressed", "true");
    await expect(mapButton).toHaveAttribute("aria-pressed", "false");
  });

  test("search filters form is accessible", async ({ page }) => {
    await page.goto("/search?q=Sydney&beds=2");

    // Check search filters form exists
    const filtersForm = page.getByRole("form", { name: "Search filters" });
    await expect(filtersForm).toBeVisible();

    // Check various filter inputs are present
    const searchInput = page.getByLabel(/search/i).first();
    await expect(searchInput).toBeVisible();

    const bedsInput = page.getByLabel(/bedrooms?/i);
    await expect(bedsInput).toBeVisible();

    const bathsInput = page.getByLabel(/bathrooms?/i);
    await expect(bathsInput).toBeVisible();
  });
});

