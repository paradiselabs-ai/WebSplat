These are examples for using the NVIDIA model. 

PLEASE NOTE THAT THE API KEY IS IN THE .env FILE IN THE ROOT DIRECTORY, LISTED AS NVIDIA_API_KEY=<api_key> 

THESE EXAMPLES SHOW A PLACEHOLDER API KEY WRITTEN IN THE ACTUAL CODE, SO KEEP THAT IN MIND WHEN CODING THEM INTO THE PROJECT PROPERLY AND INSTEAD OF HARDCODING THE API KEYS DIRECTLY, import os and use the .env NVIDIA_API_KEY.

Python example:

from openai import OpenAI

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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"
)

completion = client.chat.completions.create(
  model="meta/llama-3.1-405b-instruct",
  messages=[{"role":"user","content":"Write a limerick about the wonders of GPU computing."}],
  temperature=0.2,
  top_p=0.7,
  max_tokens=1024,
  stream=True
)

for chunk in completion:
  if chunk.choices[0].delta.content is not None:
    print(chunk.choices[0].delta.content, end="")



NODE example:

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
 
async function main() {
  const completion = await openai.chat.completions.create({
    model: "meta/llama-3.1-405b-instruct",
    messages: [{"role":"user","content":"Write a limerick about the wonders of GPU computing."}],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 1024,
    stream: true
  })
   
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
  }
  
}

main();