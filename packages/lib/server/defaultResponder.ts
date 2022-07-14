import type { NextApiRequest, NextApiResponse } from "next";

import { getServerErrorFromUnkown } from "./getServerErrorFromUnkown";
import { performance } from "./perfObserver";

type Handle<T> = (req: NextApiRequest, res: NextApiResponse) => Promise<T>;

/** Allows us to get type inference from API handler responses */
function defaultResponder<T>(f: Handle<T>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let ok = false;
    try {
      performance.mark("Start");
      const result = await f(req, res);
      ok = true;
      if (result) res.json(result);
    } catch (err) {
      const error = getServerErrorFromUnkown(err);
      res.statusCode = error.statusCode;
      res.json({ message: error.message });
    } finally {
      performance.mark("End");
      performance.measure(`[${ok ? "OK" : "ERROR"}][$1] ${req.method} '${req.url}'`, "Start", "End");
    }
  };
}

export default defaultResponder;