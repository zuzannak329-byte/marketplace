
from playwright.sync_api import sync_playwright, expect

def verify_product_loading_state():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the shop page
        page.goto("http://localhost:8080/shop.html")

        # Wait for product cards
        page.wait_for_selector(".product-card")

        # Find a product (e.g. the camera)
        camera_card = page.get_by_text("Blackmagic Pocket Cinema Camera 6k").first.locator("xpath=../..")
        buy_button = camera_card.locator("a.btn--primary")

        buy_button.click()

        # Wait for navigation to product page
        # Check if loading indicator appears (it might be fast, so this is hard to catch,
        # but we can verify that the "static" content is NOT visible initially)

        # We can check that the title is NOT "iPhone 14 Pro Max" immediately after navigation starts
        # or that the #product-loading is present.

        # Since we are on localhost it might be too fast.

        # However, we can at least verify that the final state is correct and we dont see iPhone 14.

        # Let s verify the loading element exists
        loading_indicator = page.locator("#product-loading")
        expect(loading_indicator).to_be_attached()

        # Wait for the correct title
        title_locator = page.locator(".product-info__title")
        expect(title_locator).to_have_text("Blackmagic Pocket Cinema Camera 6k", timeout=10000)

        # Verify the breadcrumb is correct (it should be updated by JS)
        breadcrumb = page.locator(".breadcrumbs__link--active")
        expect(breadcrumb).to_have_text("Blackmagic Pocket Cinema Camera 6k")

        print("Verification successful!")
        page.screenshot(path="verification/loading_fix_verification.png")
        browser.close()

if __name__ == "__main__":
    verify_product_loading_state()
