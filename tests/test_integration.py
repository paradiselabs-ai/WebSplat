import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests

BASE_URL = "http://localhost:3000"  # Frontend URL
API_URL = "http://localhost:8000"  # Backend API URL

@pytest.fixture
def driver():
    driver = webdriver.Chrome()  # Make sure you have ChromeDriver installed
    driver.get(BASE_URL)
    yield driver
    driver.quit()

def test_end_to_end_workflow(driver):
    # Step 1: Send a message and verify the response
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    input_field.send_keys("Create a landing page for a fitness app")
    submit_button.click()

    # Wait for the AI response
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-[#31312E]"))
    )

    # Verify the AI response is displayed
    ai_response = driver.find_element(By.CSS_SELECTOR, ".bg-[#31312E]")
    assert ai_response.is_displayed()

    # Step 2: Check progress report
    progress_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Progress')]")
    progress_tab.click()

    get_progress_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Get Progress Report')]"))
    )
    get_progress_button.click()

    # Wait for the progress report to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre.whitespace-pre-wrap"))
    )

    progress_report = driver.find_element(By.CSS_SELECTOR, "pre.whitespace-pre-wrap")
    assert progress_report.is_displayed()

    # Step 3: Check strategy explanation
    monetization_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Monetization')]")
    monetization_tab.click()

    explain_strategy_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Explain Monetization Strategy')]"))
    )
    explain_strategy_button.click()

    # Wait for the strategy explanation to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h3[contains(text(), 'Monetization Strategy Explanation')]"))
    )

    strategy_explanation = driver.find_element(By.XPATH, "//h3[contains(text(), 'Monetization Strategy Explanation')]")
    assert strategy_explanation.is_displayed()

    # Step 4: Verify backend API responses
    # Test consult endpoint
    consult_response = requests.post(f"{API_URL}/consult", json={"message": "Create a landing page for a fitness app", "autonomy_level": 50})
    assert consult_response.status_code == 200
    assert "message" in consult_response.json()

    # Test progress report endpoint
    progress_response = requests.get(f"{API_URL}/progress_report")
    assert progress_response.status_code == 200
    assert "report" in progress_response.json()

    # Test explain strategy endpoint
    strategy_response = requests.post(f"{API_URL}/explain_strategy", json={"strategy_type": "monetization"})
    assert strategy_response.status_code == 200
    assert "explanation" in strategy_response.json()

if __name__ == "__main__":
    pytest.main([__file__])
