import { Tree, transaction, error } from "./schematics";
import { read } from "./files";
import { insertImport } from "@schematics/angular/utility/ast-utils";
//import { createSourceFile, ScriptTarget } from "typescript";

//todo: error TS2498: Module '"node_modules/typescript/lib/typescript"' uses 'export =' and cannot be used with 'export *'.
//https://stackoverflow.com/questions/63604177/how-to-re-export-from-a-module-that-uses-export
//export * from "typescript";
export * from "@schematics/angular/utility/ast-utils";

//utility/tsconfig.ts exists in the source code, but not exists in npm package
//export * from "@schematics/angular/utility/tsconfig";
export * from "@schematics/angular/utility/lint-fix";

/**
 * add ImportDeclaration
 *
 * ex: import { element } from 'fromPath'
 *     import * as element from 'fromPath'
 *     import from 'fromPath'
 * @method addImports
 * @param  tree      [description]
 * @param  fromPath  [description]
 * @param  toPath    [description]
 * @param  symbol    [description]
 * @return [description]
 *
 */
export interface Imports {
  [element: string]: string;
}
export function addImports(
  tree: Tree,
  toPath: string,
  imports: Imports,
  isDefault = false // import element from "fromPath"
) {
  let content = read(tree, toPath);
  if (!content)
    error(`file ${toPath} dosen\'t exist or empty`, "tools/typescript");

  let source = createSourceFile(toPath, content, ScriptTarget.Latest, true),
    changes = [];

  for (let element in imports) {
    element = element.trim();
    let fromPath = imports[element];

    //todo: if(element==="") import 'fromPath', not: import from 'fromPath'
    //https://github.com/angular/angular-cli/issues/18138

    changes.push(
      insertImport(
        source,
        toPath,
        element,
        fromPath,
        isDefault || element.startsWith("* as") || element === ""
      )
    );
  }

  transaction(tree, toPath, changes);
}
