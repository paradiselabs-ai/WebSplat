Build with Claude
Prompt Caching (beta)
Prompt Caching is a powerful feature that optimizes your API usage by allowing resuming from specific prefixes in your prompts. This approach significantly reduces processing time and
costs for repetitive tasks or prompts with consistent elements.
Here’s an example of how to implement Prompt Caching with the Messages API using a cache_control block:
curl https://api.anthropic.com/v1/messages \
-H "content-type: application/json" \
-H "x-api-key: $ANTHROPIC_API_KEY" \
-H "anthropic-version: 2023-06-01" \
-H "anthropic-beta: prompt-caching-2024-07-31" \
-d '{
"model": "claude-3-5-sonnet-20240620",
"max_tokens": 1024,
"system": [
{
"type": "text",
"text": "You are an AI assistant tasked with analyzing literary works. Your goal is to provide insightful commentary on themes, characters, and writ
},
{
"type": "text",
"text": "<the entire contents of Pride and Prejudice>",
"cache_control": {"type": "ephemeral"}
}
],
"messages": [
{
"role": "user",
"content": "Analyze the major themes in Pride and Prejudice."
}
]
}'
In this example, the entire text of “Pride and Prejudice” is cached using the cache_control parameter. This enables reuse of this large text across multiple API calls without reprocessing it
each time. Changing only the user message allows you to ask various questions about the book while utilizing the cached content, leading to faster responses and improved efficiency.
Prompt Caching is in beta
We’re excited to announce that Prompt Caching is now in public beta! To access this feature, you’ll need to include the anthropic-beta: prompt-caching-2024-07-31 header in your
API requests.
We’ll be iterating on this open beta over the coming weeks, so we appreciate your feedback. Please share your ideas and suggestions using this form.
How Prompt Caching works
When you send a request with Prompt Caching enabled:
1. The system checks if the prompt prefix is already cached from a recent query.
2. If found, it uses the cached version, reducing processing time and costs.
3. Otherwise, it processes the full prompt and caches the prefix for future use.
This is especially useful for:
Prompts with many examples
Large amounts of context or background information
Repetitive tasks with consistent instructions
Long multi-turn conversations
The cache has a 5-minute lifetime, refreshed each time the cached content is used.
Prompt Caching caches the full prefix
Prompt Caching references the entire prompt - tools, system, and messages (in that order) up to and including the block designated with cache_control.
Pricing
Prompt Caching introduces a new pricing structure. The table below shows the price per token for each supported model:
Model Claude 3.5 Sonnet $3 / MTok Claude 3 Haiku $0.25 / MTok Claude 3 Opus $15 / MTok Base Input Tokens Cache Writes Cache Hits Output Tokens
$3.75 / MTok $0.30 / MTok $15 / MTok
$0.30 / MTok $0.03 / MTok $1.25 / MTok
$18.75 / MTok $1.50 / MTok $75 / MTok
Note:
Cache write tokens are 25% more expensive than base input tokens
Cache read tokens are 90% cheaper than base input tokens
Regular input and output tokens are priced at standard rates
How to implement Prompt Caching
Supported models
Prompt Caching is currently supported on:
Claude 3.5 Sonnet
Claude 3 Haiku
Claude 3 Opus
Structuring your prompt
Place static content (tool definitions, system instructions, context, examples) at the beginning of your prompt. Mark the end of the reusable content for caching using the cache_control
parameter.
Cache prefixes are created in the following order: tools, system, then messages.
Using the cache_control parameter, you can define up to 4 cache breakpoints, allowing you to cache different reusable sections separately.
Cache Limitations
The minimum cacheable prompt length is:
1024 tokens for Claude 3.5 Sonnet and Claude 3 Opus
2048 tokens for Claude 3 Haiku
Shorter prompts cannot be cached, even if marked with cache_control. Any requests to cache fewer than this number of tokens will be processed without caching. To see if a prompt was
cached, see the response usage fields.
The cache has a 5 minute time to live (TTL). Currently, “ephemeral” is the only supported cache type, which corresponds to this 5-minute lifetime.
What can be cached
Every block in the request can be designated for caching with cache_control. This includes:
Tools: Tool definitions in the tools array
System messages: Content blocks in the system array
Messages: Content blocks in the messages.content array, for both user and assistant turns
Images: Content blocks in the messages.content array, in user turns
Tool use and tool results: Content blocks in the messages.content array, in both user and assistant turns
Each of these elements can be marked with cache_control to enable caching for that portion of the request.
Tracking cache performance
Monitor cache performance using these API response fields, within usage in the response (or message_start event if streaming):
cache_creation_input_tokens: Number of tokens written to the cache when creating a new entry.
cache_read_input_tokens: Number of tokens retrieved from the cache for this request.
input_tokens: Number of input tokens which were not read from or used to create a cache.
Best practices for effective caching
To optimize Prompt Caching performance:
Cache stable, reusable content like system instructions, background information, large contexts, or frequent tool definitions.
Place cached content at the prompt’s beginning for best performance.
Use cache breakpoints strategically to separate different cacheable prefix sections.
Regularly analyze cache hit rates and adjust your strategy as needed.
Optimizing for different use cases
Tailor your Prompt Caching strategy to your scenario:
Conversational agents: Reduce cost and latency for extended conversations, especially those with long instructions or uploaded documents.
Coding assistants: Improve autocomplete and codebase Q&A by keeping relevant sections or a summarized version of the codebase in the prompt.
Large document processing: Incorporate complete long-form material including images in your prompt without increasing response latency.
Detailed instruction sets: Share extensive lists of instructions, procedures, and examples to fine-tune Claude’s responses. Developers often include an example or two in the prompt,
but with prompt caching you can get even better performance by including 20+ diverse examples of high quality answers.
Agentic tool use: Enhance performance for scenarios involving multiple tool calls and iterative code changes, where each step typically requires a new API call.
Talk to books, papers, documentation, podcast transcripts, and other longform content: Bring any knowledge base alive by embedding the entire document(s) into the prompt, and
letting users ask it questions.
Troubleshooting common issues
If experiencing unexpected behavior:
Ensure cached sections are identical and marked with cache_control in the same locations across calls
Check that calls are made within the 5-minute cache lifetime
Verify that tool_choice and image usage remain consistent between calls
Validate that you are caching at least the minimum number of tokens
Note that changes to tool_choice or the presence/absence of images anywhere in the prompt will invalidate the cache, requiring a new cache entry to be created.
Cache Storage and Sharing
Organization Isolation: Caches are isolated between organizations. Different organizations never share caches, even if they use identical prompts..
Exact Matching: Cache hits require 100% identical prompt segments, including all text and images up to and including the block marked with cache control. The same block must
be marked with cache_control during cache reads and creation.
Output Token Generation: Prompt caching has no effect on output token generation. The response you receive will be identical to what you would get if prompt caching was not
used.
Prompt Caching examples
To help you get started with Prompt Caching, we’ve prepared a prompt caching cookbook with detailed examples and best practices.
Below, we’ve included several code snippets that showcase various Prompt Caching patterns. These examples demonstrate how to implement caching in different scenarios, helping you
understand the practical applications of this feature:
curl https://api.anthropic.com/v1/messages \
--header "x-api-key: $ANTHROPIC_API_KEY" \
--header "anthropic-version: 2023-06-01" \
--header "content-type: application/json" \
--header "anthropic-beta: prompt-caching-2024-07-31" \
--data \
'{
"model": "claude-3-5-sonnet-20240620",
"max_tokens": 1024,
"system": [
{
"type": "text",
"text": "You are an AI assistant tasked with analyzing legal documents."
},
{
"type": "text",
"text": "Here is the full text of a complex legal agreement: [Insert full text of a 50-page legal agreement here]",
"cache_control": {"type": "ephemeral"}
}
],
"messages": [
{
"role": "user",
"content": "What are the key terms and conditions in this agreement?"
}
]
}'
This example demonstrates basic Prompt Caching usage, caching the full text of the legal agreement as a prefix while keeping the user instruction uncached.
For the first request:
input_tokens: Number of tokens in the user message only
cache_creation_input_tokens: Number of tokens in the entire system message, including the legal document
cache_read_input_tokens: 0 (no cache hit on first request)
For subsequent requests within the cache lifetime:
input_tokens: Number of tokens in the user message only
cache_creation_input_tokens: 0 (no new cache creation)
cache_read_input_tokens: Number of tokens in the entire cached system message
curl https://api.anthropic.com/v1/messages \
--header "x-api-key: $ANTHROPIC_API_KEY" \
--header "anthropic-version: 2023-06-01" \
--header "content-type: application/json" \
--header "anthropic-beta: prompt-caching-2024-07-31" \
--data \
'{
"model": "claude-3-5-sonnet-20240620",
"max_tokens": 1024,
"tools": [
{
"name": "get_weather",
"description": "Get the current weather in a given location",
"input_schema": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g. San Francisco, CA"
},
"unit": {
"type": "string",
"enum": ["celsius", "fahrenheit"],
"description": "The unit of temperature, either celsius or fahrenheit"
}
},
"required": ["location"]
}
},
# many more tools
{
"name": "get_time",
"description": "Get the current time in a given time zone",
"input_schema": {
"type": "object",
"properties": {
"timezone": {
"type": "string",
"description": "The IANA time zone name, e.g. America/Los_Angeles"
}
},
"required": ["timezone"]
},
"cache_control": {"type": "ephemeral"}
}
],
"messages": [
{
"role": "user",
"content": "What is the weather and time in New York?"
}
]
}'
In this example, we demonstrate caching tool definitions.
The cache_control parameter is placed on the final tool (get_time) to designate all of the tools as part of the static prefix.
This means that all tool definitions, including get_weather and any other tools defined before get_time, will be cached as a single prefix.
This approach is useful when you have a consistent set of tools that you want to reuse across multiple requests without re-processing them each time.
For the first request:
input_tokens: Number of tokens in the user message
cache_creation_input_tokens: Number of tokens in all tool definitions and system prompt
cache_read_input_tokens: 0 (no cache hit on first request)
For subsequent requests within the cache lifetime:
input_tokens: Number of tokens in the user message
cache_creation_input_tokens: 0 (no new cache creation)
cache_read_input_tokens: Number of tokens in all cached tool definitions and system prompt
curl https://api.anthropic.com/v1/messages \
--header "x-api-key: $ANTHROPIC_API_KEY" \
--header "anthropic-version: 2023-06-01" \
--header "content-type: application/json" \
--header "anthropic-beta: prompt-caching-2024-07-31" \
--data \
'{
"model": "claude-3-5-sonnet-20240620",
"max_tokens": 1024,
"system": [
{
"type": "text",
"text": "...long system prompt",
"cache_control": {"type": "ephemeral"}
}
],
"messages": [
{
"role": "user",
"content": [
{
"type": "text",
"text": "Hello, can you tell me more about the solar system?",
"cache_control": {"type": "ephemeral"}
}
]
},
{
"role": "assistant",
"content": "Certainly! The solar system is the collection of celestial bodies that orbit our Sun. It consists of eight planets, numerous moons,
},
{
"role": "user",
"content": [
{
"type": "text",
"text": "Tell me more about Mars.",
"cache_control": {"type": "ephemeral"}
}
]
}
]
}'
In this example, we demonstrate how to use Prompt Caching in a multi-turn conversation.
The cache_control parameter is placed on the system message to designate it as part of the static prefix.
The conversation history (previous messages) is included in the messages array. The final turn is marked with cache-control, for continuing in followups. The second-to-last user message
is marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
This approach is useful for maintaining context in ongoing conversations without repeatedly processing the same information.
For each request:
input_tokens: Number of tokens in the new user message (will be minimal)
cache_creation_input_tokens: Number of tokens in the new assistant and user turns
cache_read_input_tokens: Number of tokens in the conversation up to the previous turn
FAQ
Yes, Prompt Caching can be used alongside other API features like tool use and vision capabilities. However, changing whether there are images in a prompt or modifying tool use settings
will break the cache.
Currently, there’s no way to manually clear the cache. Cached prefixes automatically expire after 5 minutes of inactivity.
Yes, it is possible to use Prompt Caching with your Batches API requests. However, because asynchronous batch requests can be processed concurrently and in any order, we cannot
guarantee that requests in a batch will benefit from caching.