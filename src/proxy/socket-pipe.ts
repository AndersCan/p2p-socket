/**
 * https://github.com/joshuaquek/QuickProx
 * Copyright 2021 Joshua Quek
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { Socket } from "node:net";
import { getLogger } from "../logger";
import { Duplex } from "node:stream";
/**
 * `stream#pipeline`, for some reasons,  gives errors.
 */
export function socketPipe(
  localsocket: Duplex,
  remotesocket: Socket,
  id: string
) {
  const logger = getLogger();
  localsocket.on("connect", function (/*data*/) {
    logger.info(`${id} - connected`);
  });

  localsocket.on("data", function (data) {
    logger.info(`${id} - writing data to remote`);

    var flushed = remotesocket.write(data);
    if (!flushed) {
      logger.info(`${id} - remote not flushed; pausing local`);
      localsocket.pause();
    }
  });

  remotesocket.on("data", function (data) {
    logger.info(`${id} - writing data to local`);
    var flushed = localsocket.write(data);
    if (!flushed) {
      logger.info(`${id} - local not flushed; pausing remote`);
      remotesocket.pause();
    }
  });

  localsocket.on("drain", function () {
    logger.info(`${id} - resuming remote`);
    remotesocket.resume();
  });

  remotesocket.on("drain", function () {
    logger.info(`${id} - resuming local`);
    localsocket.resume();
  });

  localsocket.on("close", function () {
    logger.info(`${id} - closing remote`);
    remotesocket.end();
  });

  remotesocket.on("close", function (hadError) {
    if (hadError) {
      logger.error(`${id} - error: closing local`);
    } else {
      logger.info(`${id} - closing local`);
    }
    localsocket.end();
  });
}
