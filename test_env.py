import os
import json
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the base64 encoded GOOGLE_APPLICATION_CREDENTIALS
credentials_base64 = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_BASE64')

if credentials_base64:
    print(f"Length of base64 encoded credentials: {len(credentials_base64)}")

    try:
        # Decode the base64 string
        credentials_json = base64.b64decode(credentials_base64).decode('utf-8')
        
        print("\nDecoded JSON:")
        print(credentials_json[:100] + "..." + credentials_json[-100:])

        # Parse the JSON
        credentials_info = json.loads(credentials_json)
        
        print("\nJSON successfully parsed")
        print(f"Project ID: {credentials_info.get('project_id')}")
        print(f"Client Email: {credentials_info.get('client_email')}")
    except Exception as e:
        print(f"\nError decoding or parsing credentials: {str(e)}")
else:
    print("GOOGLE_APPLICATION_CREDENTIALS_BASE64 not found in environment variables")