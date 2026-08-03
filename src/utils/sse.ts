export async function readSSEResponse(
  url: string,
  bodyData: any,
  onEvent: (event: string, data: any) => void
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  if (!reader) return;

  let currentEvent = 'message';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete trailing line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('event:')) {
        currentEvent = trimmed.slice(6).trim();
      } else if (trimmed.startsWith('data:')) {
        const dataStr = trimmed.slice(5).trim();
        try {
          const parsedData = JSON.parse(dataStr);
          onEvent(currentEvent, parsedData);
        } catch {
          // ignore non-json data lines
        }
      }
    }
  }
}
