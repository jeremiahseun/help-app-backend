// pages/api/api-docs/[...slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import swaggerJSDoc from 'swagger-jsdoc';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import fs from 'fs';
import path from 'path';

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: { title: "Help App API", version: "1.0.0" },
        servers: [{ url: "http://localhost:3000" }],
    },
    apis: ["./pages/api/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
// this points to the swagger-ui dist folder
const swaggerUiDir = getAbsoluteFSPath(); // : contentReference[oaicite: 0]{ index = 0 }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug : [];

    // 1) Serve the JSON spec
    if (slug[0] === "swagger.json") {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(swaggerSpec);
    }

    // 2) Serve a static asset (CSS, JS, images) or index.html
    //    e.g. GET /api/api-docs → slug=[], serve index.html
    //         GET /api/api-docs/swagger-ui.css → slug=["swagger-ui.css"]
    const assetPath = slug.length > 0 ? slug.join("/") : "index.html";
    const filePath = path.join(swaggerUiDir, assetPath);

    try {
        let file = fs.readFileSync(filePath);

        // If it’s the main HTML, inject your JSON URL
        if (assetPath === "index.html") {
            let html = file.toString();
            html = html.replace(
                "https://petstore.swagger.io/v2/swagger.json",
                "/api/api-docs/swagger.json"
            );
            res.setHeader("Content-Type", "text/html");
            return res.status(200).send(html);
        }

        // Otherwise detect the content type
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes: Record<string, string> = {
            ".css": "text/css",
            ".js": "application/javascript",
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".html": "text/html",
            ".json": "application/json",
        };
        const contentType = contentTypes[ext] || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        return res.status(200).send(file);
    } catch {
        return res.status(404).end();
    }
}
