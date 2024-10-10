import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.fixture
def driver():
    driver = webdriver.Chrome()  # Make sure you have ChromeDriver installed
    driver.get("http://localhost:3000")  # Assuming the frontend is running on port 3000
    yield driver
    driver.quit()

def test_initial_render(driver):
    assert "WebSplat" in driver.title

def test_chat_interaction(driver):
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    input_field.send_keys("Create a landing page for a fitness app")
    submit_button.click()

    # Wait for the response
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-[#31312E]"))
    )

    # Check if the AI response is displayed
    ai_response = driver.find_element(By.CSS_SELECTOR, ".bg-[#31312E]")
    assert ai_response.is_displayed()

def test_sidebar_navigation(driver):
    # Test opening the sidebar
    sidebar_toggle = driver.find_element(By.CSS_SELECTOR, "button[title='Toggle Sidebar']")
    sidebar_toggle.click()

    # Wait for the sidebar to open
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "aside.translate-x-0"))
    )

    # Test navigating to different views
    views = ["UI Design", "Monetization", "SEO", "Analytics", "Deployment"]
    for view in views:
        view_button = driver.find_element(By.XPATH, f"//button[contains(text(), '{view}')]")
        view_button.click()

        # Wait for the view content to load
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, f"//h2[contains(text(), '{view}')]"))
        )

        # Check if the view content is displayed
        view_content = driver.find_element(By.XPATH, f"//h2[contains(text(), '{view}')]")
        assert view_content.is_displayed()

def test_autonomy_level_adjustment(driver):
    # Open the sidebar
    sidebar_toggle = driver.find_element(By.CSS_SELECTOR, "button[title='Toggle Sidebar']")
    sidebar_toggle.click()

    # Wait for the sidebar to open
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "aside.translate-x-0"))
    )

    # Find the autonomy level slider
    autonomy_slider = driver.find_element(By.CSS_SELECTOR, "input[type='range']")

    # Change the autonomy level
    driver.execute_script("arguments[0].value = 75;", autonomy_slider)
    driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", autonomy_slider)

    # Check if the autonomy level display is updated
    autonomy_display = driver.find_element(By.XPATH, "//label[contains(text(), 'AI Autonomy Level')]")
    assert "75%" in autonomy_display.text

if __name__ == "__main__":
    pytest.main([__file__])
