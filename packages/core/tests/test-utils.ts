import { Readable } from "stream";

/**
 * Reads all the text in a readable stream and returns it as a string,
 * via a Promise.
 * @param {stream.Readable} readable
 */
export function readableToString(
  readable: Readable,
  onData?: (chunk: string, currentContent: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    readable.on("data", function (chunk) {
      if (typeof chunk !== "string" && chunk !== null) {
        throw new Error("Unsupported chunk type");
      }
      if (onData) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        onData(chunk, data);
      }
      data += chunk;
    });

    readable.on("end", function () {
      resolve(data);
    });
    readable.on("error", function (err) {
      reject(err);
    });
  });
}

export async function* streamProcessor(readable: Readable) {
  let buffer = "";

  for await (const chunk of readable) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    buffer += chunk.toString();

    // Check if the buffer contains "FLUSH"
    let flushIndex = buffer.indexOf("FLUSH");
    while (flushIndex !== -1) {
      yield buffer.slice(0, flushIndex);
      buffer = buffer.slice(flushIndex + 5); // +5 to skip "FLUSH"
      flushIndex = buffer.indexOf("FLUSH");
    }
  }

  yield null; // yield null at the end when the stream is finished
}

interface StaticElementOptions {
  type?: string;
  withOnClick?: boolean;
  withTextChild?: string;
  withChild?: SXL.StaticElement;
  withDataSet?: DOMStringMap;
  withProps?: SXL.Props;
}
export function withSxlStaticElement(
  opts?: StaticElementOptions
): SXL.StaticElement {
  const type = opts?.withOnClick ? opts.type ?? "button" : opts?.type ?? "p";
  const children: Array<string | SXL.StaticElement> = [];

  if (opts?.withTextChild) {
    children.push(opts.withTextChild);
  }
  if (opts?.withChild) {
    children.push(opts.withChild);
  }

  const dataset = opts?.withDataSet ?? {};
  return {
    type,
    props: {
      dataset,
      ...opts?.withProps,
    },
    children,
  };
}