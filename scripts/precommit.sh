#!/bin/bash

# npx prettier --write .
npm run build -w packages/core
npm run build -w packages/app
npx jest
