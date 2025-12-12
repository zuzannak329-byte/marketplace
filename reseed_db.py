from playwright.sync_api import sync_playwright
import time

def reseed_database():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        print("Loading page to initialize scripts...")
        page.goto("http://localhost:8080/home.html")

        print("Waiting for page load...")
        page.wait_for_selector("body")
        time.sleep(3) # Wait for modules to load

        print("Executing reseedProducts()...")
        # Execute script in browser context
        page.evaluate("window.reseedProducts()")

        # Wait for Firestore operations (logs should appear)
        time.sleep(10)

        print("Reseed command sent.")
        browser.close()

if __name__ == "__main__":
    reseed_database()
