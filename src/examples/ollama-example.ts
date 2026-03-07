import ollama from 'ollama';

const response = await ollama.chat({
  model: 'qwen2.5:1.5b',
  messages: [{ role: 'user', content: 'Hello!' }]
});
console.log(response.message);
