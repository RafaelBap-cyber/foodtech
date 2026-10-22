const authRoutes = require("./routes/authRoutes");
const ongRoutes = require("./routes/ongRoutes");
const donationRoutes = require("./routes/donationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const locationRoutes = require("./routes/locationRoutes");

const modules = [authRoutes, ongRoutes, donationRoutes, contactRoutes, locationRoutes];

function partsOf(pathname) {
  return pathname.split("/").filter(Boolean);
}

function findRoute(method, pathname) {
  const target = partsOf(pathname);

  for (const mod of modules) {
    for (const route of mod.routes) {
      if (route.method !== method) continue;

      const fullPath = `${mod.basePath}${route.path}`.replace(/\/$/, "") || "/";
      const parts = partsOf(fullPath);
      if (parts.length !== target.length) continue;

      const params = {};
      const matches = parts.every((part, index) => {
        if (part.startsWith(":")) {
          params[part.slice(1)] = decodeURIComponent(target[index]);
          return true;
        }
        return part === target[index];
      });

      if (matches) return { ...route, params };
    }
  }

  return null;
}

module.exports = { modules, findRoute };
