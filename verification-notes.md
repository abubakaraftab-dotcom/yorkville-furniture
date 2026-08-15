# Yorkville Furniture Verification Notes

- `npm ci --no-audit --no-fund` completed successfully.
- `npm run build` completed successfully with Next.js static export and generated 71 static routes.
- The initial `next start` preview is not valid for `output: export`; static output was correctly previewed with `python3 -m http.server` from `out/`.
- Homepage rendered successfully at the local static preview.
- Browser content confirmed the new premium hero copy, product imagery, CTA links, and slideshow controls for slides 1, 2, and 3.
- A second browser view confirmed the automatic slideshow advanced from slide 1 (`01 / 03`) to slide 2 (`02 / 03`) without errors.
- Hero uses existing Yorkville product assets: sectional sofa, oak dining table, and walnut bed frame.
- Deployment workflows created: `.github/workflows/deploy-test.yml` uploads `out/` to `/test-deploy/`; `.github/workflows/deploy-live.yml` uploads `out/` to `/`.
- Both workflows are manual (`workflow_dispatch`) and require GitHub secrets `FTP_SERVER`, `FTP_USERNAME`, and `FTP_PASSWORD`.
- The requested live deployment has not been run yet; test deployment should be run and checked first.
