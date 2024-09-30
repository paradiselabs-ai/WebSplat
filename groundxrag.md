
## Basic Ground X RAG authorization

```shell
pip install groundx-python-sdk
```

```python
from pprint import pprint
from groundx import Groundx

groundx = Groundx(
    api_key="API_KEY_AUTH"
)

response = groundx.search.content(
    id=0,
    next_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
    query="my search query"
)

print(response.body)
```

## Upload Documents from a Remote Location to GroundX ##

# This tutorial will show you how to use GroundX's Typescript and Python SDK libraries to upload hosted documents to your GroundX buckets

Through a simple API request you can effortlessly upload your content to GroundX and automatically pre-process your data to get it ready to be searched through.
Prerequisites

    Node.js installed (for Javascript or Typescript projects)
    Python 3.7 or higher installed (for Python projects)

# Code samples

You can download the code for this tutorial from the GroundX code sample repository in Typescript (for Javascript and Node.js projects) or Python.
Step 1: Set up your environment

    Install the GroundX SDK for either Typescript or Python with the following commands:

```shell
pip install groundx-python-sdk
```

Step 2: Import required libraries

In your project, import the GroundX SDK library:

```python
from groundx import Groundx, ApiException
```

Step 3: Set up your API key

Set up your API key by creating a new GroundX object and passing your API key as a parameter:

```python
groundxKey = 'YOUR_GROUNDX_KEY'
```

It is recommended that you store your API key in an environment variable and access it from there. For example, using the dotenv library in Node.js or the os library in Python.
Step 4: Set up content ingestion parameters

Set up the parameters for the content ingestion request. For more information on the parameters for uploading hosted documents to GroundX, go to the

reference guide.

    Indicate the ID of the bucket you want to ingest the content into by setting the bucket parameter.

```python
bucketID = 0
```

For simplicity, in this tutorial we'll set bucketID to 0 to ingest the content into a default bucket (See Step 7).

Set a variable to indicate the type of content you want to ingest. Currently, the supported file types are:
    txt
    docx
    pptx
    xlsx
    pdf
    png
    jpg

For example:

```python
fileType = '<FILE_TYPE>'
```

Set a variable to indicate the URL of the content you want to ingest. For example:

```python
ingestHosted = '<URL>'
```

Optional: Include an object containing metadata for your content. For example:

```python
contentMetadata = {
    "title": "Sample Title",
    "description": "Sample Description",
    "author": "Sample Author",
    "tags": ["Sample Tag 1", "Sample Tag 2"]
}
```

# Metadata #

Although metadata is automatically extracted from the content during the ingestion process, you can also include your own metadata. When GroundX carries out search querires, it searches through not only your content but also the associated metadata. This helps provide more accurate search results and returns document chunks with the corresponding metadata so that you don't lose the context the metadata provides.
Step 5: Set parameter validation

Optional: Set up parameter validation to check if all the required parameters are set. For example:

```python
if groundxKey == "":
    raise Exception("set your GroundX key")

if ingestHosted == "":
    raise Exception("set the hosted file URL")

if fileType == "":
    raise Exception("set the file type to a supported enumerated type (e.g. txt, pdf)")
```

Step 6: Initialize the GroundX client

Initialize the GroundX client by creating a new GroundX object and passing your API key as a parameter. For example:

```python
groundx = Groundx(
    api_key=groundxKey,
)
```

Step 7: Get default bucket ID

Before uploading the content, we'll set the default bucket ID. Since we set the bucket ID to 0 in Step 4.1, we'll now call the

endpoint to check if any buckets exist and get the ID of the first bucket in the list. For example:

```python
if bucketId == 0:
    # list buckets request
    try:
        bucket_response = groundx.buckets.list()

        if len(bucket_response.body["buckets"]) < 1:
            print(bucket_response.body["buckets"])
            raise Exception("no results from buckets")

        bucketId = bucket_response.body["buckets"][0]["bucketId"]
    except ApiException as e:
        print("Exception when calling BucketApi.list: %s\n" % e)
```

Step 8: Upload the content

Upload the content by calling the

endpoint with the parameters you set in Step 4 as arguments. For example:

# Upload hosted documents to GroundX request

```python
try:
    ingest = groundx.documents.ingest_remote(
        documents=[
            {
                "bucketId": bucketId,
                "metadata": contentMetadata,
                "sourceUrl": ingestHosted,
                "fileType": fileType,
            }
        ],
    )
```

The

endpoint returns a response object indicating the status of the ingestion process.

For example:

// Successful request response

```python
{
  "ingest": {
    "processId": "string", // Object ID of the ingest process
    "status": "string" // "queued" | "processing" | "error" | "complete"
  }
}
```

Step 9: Get ingest status

To check the status of the ingestion process, we'll use the request response and the

endpoint. For example:

# Insert this code after the Try block in Step 8

```python
while (
        ingest.body["ingest"]["status"] != "complete"
        and ingest.body["ingest"]["status"] != "error"
    ):
        ingest = groundx.documents.get_processing_status_by_id(
            process_id=ingest.body["ingest"]["processId"]
        )
except ApiException as e:
    print("Exception when calling DocumentApi.ingest_remote: %s\n" % e)
```

Step 10: Test your code

    After you have adjustmented the code accordingly, run your code to upload the content to GroundX.
    Call the 

    endpoint to from GroundX's interactive API Reference guide to get a list of all the documents in your GroundX buckets.
    Check if the content you uploaded is listed in the response.

Congratulations!
You've successfully ingested a hosted document to GroundX that you can now search through using GroundX's search API.

## Upload documents stored locally

Upload Local Documents to GroundX

This tutorial will show you how to use GroundX's Typescript and Python SDK libraries to upload local documents to your GroundX buckets.

Set up the parameters for the content ingestion request. For more information on the parameters for uploading local documents to GroundX, go to the

reference guide.

    Indicate the ID of the bucket you want to ingest the content into by setting the bucket parameter.

```python
bucketID = 0
```

For simplicity, in this tutorial we'll set bucketID to 0 to ingest the content into a default bucket (See Step 7).

    Set a variable to indicate the type of content you want to ingest. Currently, the supported file types are:

    txt
    docx
    pptx
    xlsx
    pdf
    png
    jpg

For example:

```python
fileType = '<FILE_TYPE>'
```

    Set a variable to indicate the relative path of the local content you want to ingest. For example:

```python
ingestLocal = '<RELATIVE_LOCAL_PATH>'
```

    Optional: Include an object containing metadata for your content. For example:

```python
contentMetadata = {
    "title": "Sample Title",
    "description": "Sample Description",
    "author": "Sample Author",
    "tags": ["Sample Tag 1", "Sample Tag 2"]
}
```

# Metadata

Although metadata is automatically extracted from the content during the ingestion process, you can also include your own metadata. When GroundX carries out search querires, it searches through not only your content but also the associated metadata. This helps provide more accurate search results and returns document chunks with the corresponding metadata so that you don't lose the context the metadata provides.
Step 5: Set parameter validation

Optional: Set up parameter validation to check if all the required parameters are set. For example:

```python
if groundxKey == "YOUR_GROUNDX_KEY":
    raise Exception("set your GroundX key")

if ingestLocal == "":
    raise Exception("set the local file path")

if fileType == "":
    raise Exception("set the file type to a supported enumerated type (e.g. txt, pdf)")

if fileName == "":
    raise Exception("set a name for the file")
```

Step 6: Initialize the GroundX client

Initialize the GroundX client by creating a new GroundX object and passing your API key as a parameter. For example:

```python
groundx = Groundx(
    api_key=groundxKey,
)
```

Step 7: Get default bucket ID

Before uploading the content, we'll set the default bucket ID. Since we set the bucket ID to 0 in Step 4.1, we'll now call the

endpoint to check if any buckets exist and get the ID of the first bucket in the list. For example:

```python
if bucketId == 0:
    # list buckets
    try:
        bucket_response = groundx.buckets.list()

        if len(bucket_response.body["buckets"]) < 1:
            print(bucket_response.body["buckets"])
            raise Exception("no results from buckets")

        bucketId = bucket_response.body["buckets"][0]["bucketId"]
    except ApiException as e:
        print("Exception when calling BucketApi.list: %s\n" % e)
```

Step 8: Upload the content

Upload the content by calling the

endpoint with the parameters you set in Step 4 as arguments. For example:

# upload local documents to GroundX

```python
try:
    ingest = groundx.documents.ingest_local(
        body=[
            {
                "blob": open(ingestLocal, "rb"),
                "metadata": {
                    "bucketId": bucketId,
                    "fileName": fileName,
                    "fileType": fileType,
                    # optional metadata field
                    # content is added to document chunks
                    # fields are search during search requests
                    # and returned in search results
                    "metadata": contentMetadata,
                },
            },
        ]
    )
```

The

endpoint returns a response object indicating the status of the ingestion process.

For example:

// Successful request response

```python
{
  "ingest": {
    "processId": "string", // Object ID of the ingest process
    "status": "string" // "queued" | "processing" | "error" | "complete"
  }
}
```

Step 9: Get ingest status

To check the status of the ingestion process, we'll use the request response and the

endpoint. For example:

# Insert this code after the Try block in Step 8.x

```python
 while (
        ingest.body["ingest"]["status"] != "complete"
        and ingest.body["ingest"]["status"] != "error"
    ):
        ingest = groundx.documents.get_processing_status_by_id(
            process_id=ingest.body["ingest"]["processId"]
        )
except ApiException as e:
    print("Exception when calling DocumentApi.ingest_local: %s\n" % e)
```

Step 10: Test your code

    After you have adjustmented the code accordingly, run your code to upload the content to GroundX.
    Call the 

    endpoint to from GroundX's interactive API Reference guide to get a list of all the documents in your GroundX buckets.
    Check if the content you uploaded is listed in the response.

And that's it!
You've successfully ingested a local document to GroundX that you can now search through using GroundX's search API.
