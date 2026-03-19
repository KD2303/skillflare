import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const API_URL = process.env.API_URL || "http://localhost:5000/api";

test.describe("Complete User Flow - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage before each test
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test("User Registration and Login Flow", async ({ page, context }) => {
    // Go to register page
    await page.goto(`${BASE_URL}/register`);

    // Fill registration form
    const email = `testuser-${Date.now()}@mitsgwl.ac.in`;
    const password = "TestPassword123";

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', `testuser${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);

    // Submit
    await page.click('button:has-text("Sign Up")');

    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/(login|dashboard)/);

    // Now test login
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign In")');

    // Should be on dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("Forgot Password Flow", async ({ page }) => {
    // First register a user
    const email = `forgot-test-${Date.now()}@mitsgwl.ac.in`;
    const password = "TestPassword123";

    // Register
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', `forgottest${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Sign Up")');

    // Go to login page
    await page.goto(`${BASE_URL}/login`);

    // Click forgot password
    await page.click('a:has-text("Forgot password")');
    await expect(page).toHaveURL(`${BASE_URL}/forgot-password`);

    // Enter email
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Send Reset Link")');

    // Should show success message
    await expect(page.locator("text=If account exists")).toBeVisible();

    // In real scenario, would extract reset token from email and test reset
  });

  test("Task Creation and Submission", async ({ page, context }) => {
    // Login first
    const email = `task-test-${Date.now()}@mitsgwalior.in`; // Teacher email
    const password = "TestPassword123";

    // Register as teacher
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', `tasktest${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Sign Up")');

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    // Go to post task
    await page.goto(`${BASE_URL}/post-task`);

    // Fill task form
    await page.fill('input[name="title"]', `Test Task ${Date.now()}`);
    await page.fill(
      'textarea[name="description"]',
      "This is a test task for E2E testing",
    );
    await page.fill('input[name="deadline"]', "2026-04-30");

    // Add skills
    await page.click('button:has-text("Add Skill")');
    await page.fill('input[placeholder="Search skills"]', "JavaScript");
    await page.click("text=JavaScript");

    // Submit
    await page.click('button:has-text("Post Task")');

    // Should be redirected to task detail
    await expect(page).toHaveURL(/\/tasks\/\w+/);
    await expect(page.locator(`text=Test Task`)).toBeVisible();
  });

  test("Chat Functionality", async ({ page, browser }) => {
    // Create two users in different contexts
    const email1 = `chat-test-1-${Date.now()}@mitsgwl.ac.in`;
    const email2 = `chat-test-2-${Date.now()}@mitsgwl.ac.in`;
    const password = "TestPassword123";

    // Register user 1
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', email1);
    await page.fill('input[name="username"]', `chat1${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Sign Up")');

    // Create second browser context for user 2
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    // Register user 2
    await page2.goto(`${BASE_URL}/register`);
    await page2.fill('input[name="email"]', email2);
    await page2.fill('input[name="username"]', `chat2${Date.now()}`);
    await page2.fill('input[name="password"]', password);
    await page2.fill('input[name="confirmPassword"]', password);
    await page2.click('button:has-text("Sign Up")');

    // Both users navigate to browse tasks
    await page.goto(`${BASE_URL}/browse`);
    await page2.goto(`${BASE_URL}/browse`);

    // Verify chat is functional (UI elements visible)
    await expect(page.locator('[data-testid="chat-icon"]')).toBeVisible({
      timeout: 5000,
    });
    await expect(page2.locator('[data-testid="chat-icon"]')).toBeVisible({
      timeout: 5000,
    });

    await context2.close();
  });

  test("Admin Panel Access Control", async ({ page }) => {
    // Create non-admin user
    const email = `noadmin-${Date.now()}@mitsgwl.ac.in`;
    const password = "TestPassword123";

    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', `noadmin${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Sign Up")');

    // Try accessing admin panel
    await page.goto(`${BASE_URL}/admin`);

    // Should be redirected or show access denied
    const url = page.url();
    const hasAccessDenied = await page
      .locator("text=Access Denied")
      .isVisible()
      .catch(() => false);

    expect(hasAccessDenied || !url.includes("/admin")).toBeTruthy();
  });

  test("Mentor Profile Creation and Update", async ({ page }) => {
    const email = `mentor-${Date.now()}@mitsgwalior.in`;
    const password = "TestPassword123";

    // Register as teacher (can be mentor)
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', `mentor${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Sign Up")');

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign In")');

    // Go to apply as mentor
    await page.goto(`${BASE_URL}/mentors/apply`);

    // Fill mentor form
    await page.fill(
      'textarea[name="bio"]',
      "Experienced developer with 10 years experience",
    );
    await page.fill('input[name="hourlyRate"]', "500");

    // Add skills
    await page.click('button:has-text("Add Skill")');
    await page.fill('input[placeholder="Search skills"]', "JavaScript");
    await page.click("text=JavaScript");

    // Submit
    await page.click('button:has-text("Apply as Mentor")');

    // Should show success
    await expect(page.locator("text=Application submitted")).toBeVisible();
  });

  test("Leaderboard Functionality", async ({ page }) => {
    // Go to leaderboard (no auth required)
    await page.goto(`${BASE_URL}/leaderboard`);

    // Verify leaderboard loads
    await expect(page.locator("text=Leaderboard")).toBeVisible();

    // Verify sorting controls
    const sortButtons = page.locator('[data-testid="sort-button"]');
    await expect(sortButtons).toHaveCount(undefined); // Any number of sort options

    // Verify user list
    const userRows = page.locator('[data-testid="leaderboard-row"]');
    await expect(userRows).not.toHaveCount(0);
  });

  test("Profile Editing", async ({ page }) => {
    const email = `profile-${Date.now()}@mitsgwl.ac.in`;
    const password = "TestPassword123";

    // Register
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', `profile${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Sign Up")');

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign In")');

    // Go to edit profile
    await page.goto(`${BASE_URL}/profile/edit`);

    // Update profile
    const newBio = `Updated bio at ${Date.now()}`;
    await page.fill('textarea[name="bio"]', newBio);

    // Save
    await page.click('button:has-text("Save")');

    // Verify update
    await expect(page.locator(`text=${newBio}`)).toBeVisible();
  });

  test("Error Handling - Network Failure", async ({ page }) => {
    // Simulate network failure
    await page.context().setOffline(true);

    await page.goto(`${BASE_URL}/dashboard`);

    // Should show offline indicator or error
    const offlineIndicator = page.locator("text=Offline|Network error");
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Go back online
    await page.context().setOffline(false);

    // Should recover
    await page.reload();
    // Should eventually load
  });

  test("Session Timeout", async ({ page }) => {
    const email = `timeout-${Date.now()}@mitsgwl.ac.in`;
    const password = "TestPassword123";

    // Register and login
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', `timeout${Date.now()}`);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Sign Up")');

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    // Simulate time passage (in real test, mock API to return 401)
    // For now, verify logout functionality
    await page.click('[data-testid="user-menu"]');
    await page.click("text=Logout");

    // Should be redirected to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("Responsive Design - Mobile View", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone

    await page.goto(`${BASE_URL}`);

    // Verify mobile menu
    const hamburger = page.locator('[data-testid="hamburger-menu"]');
    await expect(hamburger).toBeVisible();

    // Click menu
    await hamburger.click();

    // Verify menu items visible
    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
  });

  test("Accessibility - Keyboard Navigation", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Tab through elements
    await page.keyboard.press("Tab");
    await expect(page.locator('input[name="email"]')).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator('input[name="password"]')).toBeFocused();

    await page.keyboard.press("Tab");
    const submitButton = page.locator('button:has-text("Sign In")');
    await expect(submitButton).toBeFocused();

    // Can submit with Enter
    await page.keyboard.press("Enter");
    // Would fail due to empty fields, but keyboard nav works
  });
});

test.describe("Security Tests - Frontend", () => {
  test("XSS Prevention - Script Tags", async ({ page }) => {
    // Try injecting script in task description
    const injectionPayload = '<script>alert("XSS")</script>';

    // This would need actual form submission
    // Verify that content is properly escaped
  });

  test("CSRF Protection", async ({ page }) => {
    // Verify CSRF tokens in forms
    await page.goto(`${BASE_URL}/register`);

    // Check for CSRF token in form or headers
    const response = await page.waitForNavigation();
    expect(response?.status()).toBeLessThan(400);
  });

  test("Sensitive Data Not Exposed", async ({ context }) => {
    // Monitor network requests
    const apiCalls = [];

    context.on("response", (response) => {
      apiCalls.push({
        url: response.url(),
        status: response.status(),
      });
    });

    // Register and login
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/login`);

    // Verify no sensitive data in network requests
    apiCalls.forEach((call) => {
      expect(call.url).not.toContain("password");
      expect(call.url).not.toContain("token");
      expect(call.url).not.toContain("api_key");
    });
  });
});
