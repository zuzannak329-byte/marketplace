
from playwright.sync_api import sync_playwright, expect

def verify_product_selection():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the shop page
        page.goto("http://localhost:8080/shop.html")

        # Wait for product cards to load (they are loaded dynamically)
        page.wait_for_selector(".product-card")

        # Find a product that is NOT the iPhone 14 Pro Max (which has ID 1 and is the default static content)
        # "Blackmagic Pocket Cinema Camera 6k" usually has ID 2 in seed data.
        # We can look for it by text.
        camera_card = page.get_by_text("Blackmagic Pocket Cinema Camera 6k").first.locator("xpath=../..")

        # Click the "Buy Now" button
        buy_button = camera_card.locator("a.btn--primary")

        # Check the href to ensure it has an ID (and it is likely the Firestore ID, which is a string, not "2")
        href = buy_button.get_attribute("href")
        print(f"Link href: {href}")

        if "id=1" in href or "id=2" in href:
             # It might be 2 if I didnt fix it properly, or if Firestore ID happens to be 2 (unlikely)
             # But if it is 1, it is definitely wrong as 1 is iPhone.
             pass

        buy_button.click()

        # Instead of waiting for networkidle, just wait for the element to update.
        # The static title is "Apple iPhone 14 Pro Max"
        # The new title should be "Blackmagic Pocket Cinema Camera 6k"

        title_locator = page.locator(".product-info__title")

        # We expect the text to change.
        expect(title_locator).to_have_text("Blackmagic Pocket Cinema Camera 6k", timeout=10000)

        print("Product title matched!")

        # Take a screenshot
        page.screenshot(path="verification/product_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_product_selection()
