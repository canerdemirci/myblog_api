# Creating TypeScript Project with Linter and Code Documentation Tools
- Linter : Typescript Eslint
- Documentation tools : Tsdoc and Typedoc

### Typescript Configuration
- Create "tsconfig.json" command:
> tsc --init

### Typescript Eslint

##### Packages
> npm i -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript

##### Configuration
- create .eslintrc.cjs file in project root

```json
// .eslintrc.cjs
// Recommended configurations
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,
};
```

- In package.json script section

```
"scripts": {
    "lint": "eslint -f unix \"src/**/*.{ts,tsx}\""
},
```

##### Run eslint
> npx eslint .

### Code Documentation

##### Tsdoc
> npm i @microsoft/tsdoc
> npm i @microsoft/tsdoc-config

- Create "tsdoc.json" file

```json
{
    "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json"
}
```

- Tsdoc playground: https://microsoft.github.io/tsdoc/

##### Typedoc
> npm i -D typedoc
> To build docs folder : npx typedoc --options typedoc.json

```
"scripts": {
    "doc": "npx typedoc --options typedoc.json"
},
```

- Create "typedoc.json" file

```json
{
    "$schema": "https://typedoc.org/schema.json",
    "entryPoints": ["./src"],
    "entryPointStrategy": "expand",
    "out": "docs",
}
```