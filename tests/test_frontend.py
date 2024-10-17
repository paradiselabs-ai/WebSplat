import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
import time

@pytest.fixture
def driver():
    driver = webdriver.Chrome()
    driver.get("http://localhost:3000")
    driver.implicitly_wait(10)
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
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-\\[\\#31312E\\]"))
    )

    # Check if the AI response is displayed
    ai_response = driver.find_element(By.CSS_SELECTOR, ".bg-\\[\\#31312E\\]")
    assert ai_response.is_displayed()

def test_sidebar_navigation(driver):
    # Test navigating to different views
    views = ["UI Design", "Monetization", "SEO", "Analytics", "Deployment"]
    for view in views:
        view_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//button[contains(., '{view}')]"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", view_button)
        driver.execute_script("arguments[0].click();", view_button)

        # Wait for the view content to load
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, f"//h2[contains(text(), '{view}')]"))
        )

        # Check if the view content is displayed
        view_content = driver.find_element(By.XPATH, f"//h2[contains(text(), '{view}')]")
        assert view_content.is_displayed()

def test_autonomy_level_adjustment(driver):
    # Find the autonomy level slider
    autonomy_slider = driver.find_element(By.CSS_SELECTOR, "input[type='range']")

    # Set the slider value directly using JavaScript
    driver.execute_script("arguments[0].value = 75;", autonomy_slider)
    driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", autonomy_slider)

    # Wait for the autonomy level to update
    time.sleep(1)

    # Check if the autonomy level display is updated
    autonomy_display = driver.find_element(By.XPATH, "//label[contains(text(), 'AI Autonomy Level')]")
    assert "75%" in autonomy_display.text

def test_tsx_preview_generation(driver):
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    input_field.send_keys("Create a simple React component for a fitness app homepage")
    submit_button.click()

    # Wait for the response and TSX preview to generate
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[value='preview']"))
    )

    # Navigate to the Preview tab
    preview_tab = driver.find_element(By.CSS_SELECTOR, "button[value='preview']")
    driver.execute_script("arguments[0].click();", preview_tab)

    # Wait for the TSX preview to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre code"))
    )

    # Check if the TSX preview is displayed and contains expected content
    tsx_preview = driver.find_element(By.CSS_SELECTOR, "pre code")
    assert tsx_preview.is_displayed()
    preview_text = tsx_preview.text
    assert "import React" in preview_text
    assert "const" in preview_text
    assert "return" in preview_text
    assert "export default" in preview_text

def test_tsx_preview_update(driver):
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    # Generate first TSX preview
    input_field.send_keys("Create a React component for a fitness app homepage")
    submit_button.click()

    # Wait for the response and TSX preview to generate
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[value='preview']"))
    )

    # Navigate to the Preview tab
    preview_tab = driver.find_element(By.CSS_SELECTOR, "button[value='preview']")
    driver.execute_script("arguments[0].click();", preview_tab)

    # Wait for the TSX preview to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre code"))
    )

    # Store the initial TSX preview content
    initial_tsx_preview = driver.find_element(By.CSS_SELECTOR, "pre code").text

    # Generate second TSX preview
    input_field.send_keys(Keys.CONTROL + "a")
    input_field.send_keys(Keys.DELETE)
    input_field.send_keys("Update the fitness app homepage to include a workout tracker")
    submit_button.click()

    # Wait for the TSX preview to update
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre code"))
    )

    # Check if the TSX preview has been updated
    updated_tsx_preview = driver.find_element(By.CSS_SELECTOR, "pre code").text
    assert updated_tsx_preview != initial_tsx_preview
    assert "workout tracker" in updated_tsx_preview.lower()

def test_refresh_preview_button(driver):
    # Generate initial TSX preview
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    input_field.send_keys("Create a React component for a fitness app homepage")
    submit_button.click()

    # Wait for the response and TSX preview to generate
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[value='preview']"))
    )

    # Navigate to the Preview tab
    preview_tab = driver.find_element(By.CSS_SELECTOR, "button[value='preview']")
    driver.execute_script("arguments[0].click();", preview_tab)

    # Wait for the TSX preview to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre code"))
    )

    # Store the initial TSX preview content
    initial_tsx_preview = driver.find_element(By.CSS_SELECTOR, "pre code").text

    # Click the Refresh Preview button
    refresh_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Refresh Preview')]")
    refresh_button.click()

    # Wait for the TSX preview to update
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre code"))
    )

    # Check if the TSX preview has been updated
    updated_tsx_preview = driver.find_element(By.CSS_SELECTOR, "pre code").text
    assert updated_tsx_preview == initial_tsx_preview  # The content should be the same as we haven't made any changes

def test_workspace_persistence(driver):
    # Generate initial TSX preview
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    input_field.send_keys("Create a React component for a fitness app homepage")
    submit_button.click()

    # Wait for the response and TSX preview to generate
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[value='preview']"))
    )

    # Navigate to the Preview tab
    preview_tab = driver.find_element(By.CSS_SELECTOR, "button[value='preview']")
    driver.execute_script("arguments[0].click();", preview_tab)

    # Wait for the TSX preview to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre code"))
    )

    # Store the initial TSX preview content
    initial_tsx_preview = driver.find_element(By.CSS_SELECTOR, "pre code").text

    # Refresh the page
    driver.refresh()

    # Navigate back to the Preview tab
    preview_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[value='preview']"))
    )
    driver.execute_script("arguments[0].click();", preview_tab)

    # Click the Refresh Preview button
    refresh_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Refresh Preview')]"))
    )
    refresh_button.click()

    # Wait for the TSX preview to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "pre code"))
    )

    # Check if the TSX preview content is the same as before the refresh
    updated_tsx_preview = driver.find_element(By.CSS_SELECTOR, "pre code").text
    assert updated_tsx_preview == initial_tsx_preview

def test_live_preview(driver):
    # Generate initial TSX preview
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    input_field.send_keys("Create a React component for a fitness app homepage")
    submit_button.click()

    # Wait for the response and TSX preview to generate
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[value='preview']"))
    )

    # Navigate to the Preview tab
    preview_tab = driver.find_element(By.CSS_SELECTOR, "button[value='preview']")
    driver.execute_script("arguments[0].click();", preview_tab)

    # Wait for the Live Preview to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "iframe[title='Live Preview']"))
    )

    # Check if the Live Preview iframe is displayed
    live_preview = driver.find_element(By.CSS_SELECTOR, "iframe[title='Live Preview']")
    assert live_preview.is_displayed()

def test_project_name_editing(driver):
    # Find the project name element
    project_name = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(@class, 'text-xl font-bold')]"))
    )

    # Check initial project name
    assert project_name.text == "Untitled Project"

    # Click to edit project name
    project_name.click()

    # Find the input field and change the project name
    input_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input.max-w-xs"))
    )
    input_field.clear()
    input_field.send_keys("My Fitness App")
    input_field.send_keys(Keys.RETURN)

    # Check if the project name has been updated
    updated_project_name = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(@class, 'text-xl font-bold')]"))
    )
    assert updated_project_name.text == "My Fitness App"

def test_progress_report(driver):
    # Navigate to the Progress tab
    progress_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Progress')]"))
    )
    driver.execute_script("arguments[0].click();", progress_tab)

    # Click the "Get Detailed Progress Report" button
    report_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Get Detailed Progress Report')]"))
    )
    report_button.click()

    # Wait for the progress report to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.bg-\\[\\#31312E\\] pre"))
    )

    # Check if the progress report is displayed
    progress_report = driver.find_element(By.CSS_SELECTOR, "div.bg-\\[\\#31312E\\] pre")
    assert progress_report.is_displayed()
    assert len(progress_report.text) > 0

def test_strategy_explanation(driver):
    # Navigate to the UI Design tab
    ui_design_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'UI Design')]"))
    )
    driver.execute_script("arguments[0].click();", ui_design_tab)

    # Click the "Explain UI Design Strategy" button
    explain_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Explain UI Design Strategy')]"))
    )
    explain_button.click()

    # Wait for the strategy explanation to load
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'bg-[#31312E]')]//p"))
    )

    # Check if the strategy explanation is displayed
    strategy_explanation = driver.find_element(By.XPATH, "//div[contains(@class, 'bg-[#31312E]')]//p")
    assert strategy_explanation.is_displayed()
    assert len(strategy_explanation.text) > 0

def test_groundx_rag_integration(driver):
    # Generate initial content
    input_field = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Message Eden']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    input_field.send_keys("Create a fitness app homepage with a workout tracker")
    submit_button.click()

    # Wait for the response
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-\\[\\#31312E\\]"))
    )

    # Navigate to the UI Design tab
    ui_design_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'UI Design')]"))
    )
    driver.execute_script("arguments[0].click();", ui_design_tab)

    # Check if the shared knowledge has been updated
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//li[contains(text(), 'workout tracker')]"))
    )
    shared_knowledge = driver.find_elements(By.XPATH, "//li[contains(text(), 'workout tracker')]")
    assert len(shared_knowledge) > 0

    # Generate new content that should use the existing knowledge
    input_field.send_keys(Keys.CONTROL + "a")
    input_field.send_keys(Keys.DELETE)
    input_field.send_keys("Improve the workout tracker design")
    submit_button.click()

    # Wait for the response
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-\\[\\#31312E\\]"))
    )

    # Check if the response references the existing knowledge
    ai_response = driver.find_element(By.CSS_SELECTOR, ".bg-\\[\\#31312E\\]")
    assert "workout tracker" in ai_response.text.lower()

if __name__ == "__main__":
    pytest.main([__file__])
