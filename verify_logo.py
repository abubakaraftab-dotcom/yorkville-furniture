import sys
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_selector("img[alt='Yorkville Furniture Logo']")
        page.screenshot(path="verification/screenshots/logo.png")
        print("Logo screenshot taken.")
        browser.close()

if __name__ == "__main__":
    verify()
