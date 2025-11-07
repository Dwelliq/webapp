import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays hero section with title and search bar", async ({ page }) => {
    // Check hero h1
    const heroTitle = page.getByRole("heading", {
      name: "Find Your Perfect Property",
      level: 1,
    });
    await expect(heroTitle).toBeVisible();

    // Check hero description
    const heroDescription = page.getByText(
      "Discover amazing properties for sale. Search, browse, and connect with sellers."
    );
    await expect(heroDescription).toBeVisible();

    // Check HomeSearchBar form is present
    const searchForm = page.getByRole("form", { name: "Search properties" });
    await expect(searchForm).toBeVisible();

    // Verify search inputs exist
    const searchInput = page.getByLabel("Search");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", /location|suburb|address/i);

    const priceMinInput = page.getByLabel("Min Price");
    await expect(priceMinInput).toBeVisible();

    const priceMaxInput = page.getByLabel("Max Price");
    await expect(priceMaxInput).toBeVisible();

    const bedsInput = page.getByLabel(/bedrooms?/i);
    await expect(bedsInput).toBeVisible();

    const bathsInput = page.getByLabel(/bathrooms?/i);
    await expect(bathsInput).toBeVisible();
  });

  test("displays featured listings section", async ({ page }) => {
    // Check section heading
    const sectionHeading = page.getByRole("heading", {
      name: "Featured Properties",
      level: 2,
    });
    await expect(sectionHeading).toBeVisible();

    // Check "View all" link
    const viewAllLink = page.getByRole("link", { name: /view all/i });
    await expect(viewAllLink).toBeVisible();
    await expect(viewAllLink).toHaveAttribute("href", "/search");
  });

  test("shows listings or empty state", async ({ page }) => {
    // Wait for listings section to load
    const listingsSection = page.getByRole("heading", {
      name: "Featured Properties",
      level: 2,
    });
    await expect(listingsSection).toBeVisible();

    // Check for either listings or empty state
    const emptyState = page.getByText(
      "No featured listings available at the moment."
    );
    const listingCards = page.locator('[href^="/listing/"]').filter({
      has: page.locator("img"),
    });

    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const listingCount = await listingCards.count();

    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
    } else {
      // If not empty, should have at least one listing card
      expect(listingCount).toBeGreaterThan(0);
    }
  });

  test("listing cards are accessible and clickable", async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState("networkidle");

    const listingCards = page.locator('[href^="/listing/"]').filter({
      has: page.locator("img"),
    });
    const count = await listingCards.count();

    if (count > 0) {
      // Check first listing card
      const firstCard = listingCards.first();
      await expect(firstCard).toBeVisible();

      // Verify it's a link
      await expect(firstCard).toHaveAttribute("href", /\/listing\//);

      // Check for basic listing info presence (image, text content)
      const cardImage = firstCard.locator("img");
      await expect(cardImage.first()).toBeVisible();
    }
  });
});

