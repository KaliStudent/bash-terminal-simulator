from playwright.sync_api import Page, expect
import time

LOG_FILE = "jules-scratch/verification/script.log"

def log(message):
    with open(LOG_FILE, "a") as f:
        f.write(f"{message}\\n")

def test_chat_feature(page: Page):
    # Clear log file at the beginning of the test
    with open(LOG_FILE, "w") as f:
        f.write("")

    try:
        log("Starting test...")
        page.goto("http://localhost:3000/login", timeout=60000)
        log("On login page.")
        page.get_by_label("Username").fill("admin")
        page.get_by_label("Password").fill("admin123")
        page.get_by_role("button", name="Login").click()
        log("Logged in.")

        page.goto("http://localhost:3000/student", timeout=60000)
        log("Navigated to student page.")

        expect(page.get_by_role("heading", name="Choose Your Mode")).to_be_visible(timeout=20000)
        log("Student page loaded.")

        page.screenshot(path="jules-scratch/verification/student_page.png")
        log("Screenshot taken.")

    except Exception as e:
        log(f"An error occurred: {e}")
    finally:
        log("Test finished.")
