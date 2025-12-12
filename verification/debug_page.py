from playwright.sync_api import sync_playwright

def debug():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/product.html?id=1")

        # Take immediate screenshot
        page.screenshot(path="verification/debug_initial.png")

        # Check if skeleton is visible
        try:
            page.wait_for_selector("#product-skeleton", state="visible", timeout=5000)
            print("Skeleton is visible")
        except:
            print("Skeleton is not visible")

        # Check if content is visible
        try:
            page.wait_for_selector("#product-content", state="visible", timeout=5000)
            print("Product content is visible")
        except:
            print("Product content is not visible")

        # Check title visibility
        try:
            page.wait_for_selector(".product-info__title", state="visible", timeout=5000)
            print("Title is visible")
        except:
            print("Title is not visible")

        page.screenshot(path="verification/debug_final.png")
        browser.close()

if __name__ == "__main__":
    debug()
