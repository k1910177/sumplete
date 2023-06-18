# sumplete-circuit

## Install

`pnpm i` to install dependencies  
If you are using `yarn`, make sure to add `-P` to install peer-dependencies

## Development builds

`pnpm run circom:dev` to build deterministic development circuits.

## Production builds

`pnpm run circom:prod` for production builds (using `Date.now()` as entropy)
