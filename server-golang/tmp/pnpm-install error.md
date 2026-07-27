The error you're seeing, `[ERR_PNPM_IGNORED_BUILDS]`, is a security feature introduced in newer versions of `pnpm`. By default, `pnpm` now blocks post-install build scripts from running automatically unless you explicitly approve them. 

The fix is exactly what the error message suggests. Since `pnpm approve-builds` is an interactive command, you'll need to run it yourself in your terminal:

```bash
pnpm approve-builds
select > es-build
```

When you run this command, it will give you an interactive prompt where you can select the dependencies (like `esbuild`, `sharp`, etc.) and approve them to run their build scripts. Once you've approved them, running `pnpm dev` or `pnpm install` again should work perfectly!

*(Note: Make sure you run `pnpm approve-builds` in the root of your workspace if it asks, or within the `apps/admin` directory depending on where your main lockfile resides).*