# mw-link-fetcher

The project template for NodeJS platform with Koa + Joi + TypeScript, supports Docker.

## Project setup
```
# clone this repository
git clone https://github.com/nionoku/koa-server-starter.git

# change git remote to your repository
git remote set-url origin https://github.com/your-profile/your-project-name.git

# prepare environment
sh scripts/environment.sh
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Debug your app with breakpoints
```
npm run debug
```

### Compiles for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### View logs in production
```
npm run logs
```
## Example

**POST** */fetch*
```
{
    "link": "iframe link"
}
```

*Result:*
```
{
    "m3u8: "stream link",
    "mp4": {
        "1080": "mp4 link",
        "720": "mp4 link",
        "480": "mp4 link",
        "360": "mp4 link"
    },
    "sub": "sub link"
}
```