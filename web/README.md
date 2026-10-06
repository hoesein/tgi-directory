# Web PWA

## Directory data

The canonical static directory data is in [`hoesein/city-data`](https://github.com/hoesein/city-data). The repository is included as a Git submodule at `web/public/data`; its JSON files are under the submodule's `data/` directory. The previous local JSON snapshot is retained in `web/data-backup/`, outside Vite's public asset directory.

Initialize the data repository after cloning the application:

```powershell
git submodule update --init --recursive
```

Vite serves the submodule's `data/` files under `/data/data/` during development and includes them in the production build. Production loads the bundled JSON from the same path, and the service worker precaches the JSON files for offline use. Since `city-data` is private, a deployment checkout must have read access to the submodule before building; never expose a repository token in `VITE_DATA_URL` or other client-side variables.

`VITE_DATA_URL` is an optional override for a publicly accessible mirror. Set it to the base before `/data` (for example, a public raw-content repository root); leave it empty to use the bundled submodule.

To update the checked-out data and record the selected data revision in the application repository:

```bash
git submodule update --remote web/public/data
git add web/public/data
```

Category ordering is controlled by `sort_order` in `data/categories.json`.
