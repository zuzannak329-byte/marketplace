from playwright.sync_api import sync_playwright

def verify_product_reviews():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # We need to serve the files. Since it's a static site, we can use file:// or start a python http server.
        # Starting a server is safer for relative paths and modules.
        # Assuming server is running on port 8000.

        # Navigate to a specific product page (e.g., ID 1)
        page.goto("http://localhost:8000/product.html?id=1")

        # Wait for product to load
        page.wait_for_selector(".product-info__title", state="visible")

        # Scroll to reviews section
        reviews_section = page.locator(".reviews")
        reviews_section.scroll_into_view_if_needed()

        # Wait for dynamic reviews to populate (check if hardcoded text is gone or new text is there)
        # We look for review items.
        page.wait_for_selector(".review-item", state="visible")

        # Take screenshot of the reviews section
        page.screenshot(path="verification/reviews_verification.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_product_reviews()
