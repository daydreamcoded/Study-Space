
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "apps-script");

fs.mkdirSync(output, { recursive: true });

let html = fs.readFileSync(
  path.join(root, "index.html"),
  "utf8"
);

const css = fs.readFileSync(
  path.join(root, "styles.css"),
  "utf8"
);

const js = fs.readFileSync(
  path.join(root, "app.js"),
  "utf8"
);

// Replace the external stylesheet with Apps Script HTML.
html = html.replace(
  /<link\b[^>]*href=["']styles\.css["'][^>]*>/i,
  "<?!= include('styles'); ?>"
);

// Replace the external JavaScript file.
html = html.replace(
  /<script\b[^>]*src=["']app\.js["'][^>]*>\s*<\/script>/i,
  "<?!= include('app'); ?>"
);

if (!html.includes("include('styles')") ||
    !html.includes("include('app')")) {
  throw new Error(
    "Could not find the stylesheet or script references in index.html."
  );
}

fs.writeFileSync(
  path.join(output, "index.html"),
  html
);

fs.writeFileSync(
  path.join(output, "styles.html"),
  `<style>\n${css}\n</style>`
);

fs.writeFileSync(
  path.join(output, "app.html"),
  `<script>\n${js}\n</script>`
);

console.log("StudySpace Apps Script files built successfully.");
