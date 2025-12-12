from playwright.sync_api import sync_playwright

def force_display():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/product.html?id=1")

        # Wait for product content to exist
        page.wait_for_selector("#product-content")

        # Force display block via JS just in case
        page.evaluate("document.getElementById('product-content').style.display = 'block'")

        # Check title visibility again
        try:
            page.wait_for_selector(".product-info__title", state="visible", timeout=2000)
            print("Title visible after forcing display")
        except:
            print("Title still not visible")

        # Take screenshot of reviews section
        page.evaluate("document.querySelector('.reviews').scrollIntoView()")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/reviews_forced.png")

        browser.close()

if __name__ == "__main__":
    force_display()
