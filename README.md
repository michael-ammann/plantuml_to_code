# PlantUml to Code

## Why another one?

To convert a PlantUml class diagram to real code files, so why not?

### Why another one?

All the others did not meet my requirements and were not as easy to handle as this variant.
Own parser that forgives a lot.

## Use

As soon as version 1.0.0 is available, there will be a NPM module, after that the installation is easy!

Global instalation:

`npm i -g plantuml2code`

Usage:

`plantuml2code -gs -l java -p ./demo.puml -o ./out`

## Options

```
-p --path           path to file to convert
-o --out            path to the destination folder for code files
-gs --gettersetter  if set, getter and setter will be crated
-l --lang           language to be used for the classes
```

# Contribute

> Easy, create a PR!

Create new converter for the language of your choise.
