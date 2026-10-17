import { createRender } from "@tanahiro2010/ssg/server";
import { routes } from "./routes.tsx";

export { routes };

export const render = createRender(routes);
