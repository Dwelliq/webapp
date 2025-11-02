import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export handlers directly - UploadThing handles Next.js 16 compatibility
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}) as any;

