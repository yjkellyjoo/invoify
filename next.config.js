const fs = require("fs");
const path = require("path");
const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

// DEV-only autofill data. Use the personal, gitignored local file when it
// exists; otherwise fall back to the committed example. Resolved here (at
// config time, where fs is available) so the single "@fill-values" import in
// lib/variables.ts always points at a file that exists — no seeding required.
const localFill = path.resolve(__dirname, "fill-values.local.json");
const exampleFill = path.resolve(__dirname, "fill-values.local.example.json");
const fillValuesPath = fs.existsSync(localFill) ? localFill : exampleFill;

/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
    webpack: (config) => {
        config.module.rules.push({
            test: /\.map$/,
            use: "ignore-loader",
        });
        config.resolve.alias["@fill-values"] = fillValuesPath;
        return config;
    },
};

// Bundle analyzer
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
