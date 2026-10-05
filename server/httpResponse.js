export async function readBoundedJson(response, maxBytes, label) {
  const contentLength = Number(response.headers?.get?.("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    await response.body?.cancel?.();
    throw new Error(`${label} response exceeded ${maxBytes} bytes`);
  }
  if (!response.body?.getReader) throw new Error(`${label} response body is not readable`);

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error(`${label} response exceeded ${maxBytes} bytes`);
    }
    chunks.push(Buffer.from(value));
  }

  try {
    return JSON.parse(Buffer.concat(chunks, totalBytes).toString("utf8"));
  } catch {
    throw new Error(`${label} response was not valid JSON`);
  }
}
