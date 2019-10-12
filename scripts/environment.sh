read -p "Enter project name: " PROJECT_NAME

sed -i "s/koa-server-starter/$PROJECT_NAME/" package.json
sed -i "s/koa-server-starter/$PROJECT_NAME/" config/env/env.example
sed -i "s/koa-server-starter/$PROJECT_NAME/" docker-compose.yml

npm i --save                \
    pm2                     \
    typedi                  \
    reflect-metadata        \
    koa                     \
    koa-joi-router

npm i --save-dev            \
    @types/koa-joi-router   \
    @types/mocha            \
    @types/chai             \
    @types/chai-http        \
    @types/node             \
    chai                    \
    chai-http               \
    mocha                   \
    nodemon                 \
    ts-node                 \
    tslint                  \
    typescript              \
    dotenv