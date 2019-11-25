import { Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';

export function ngAdd(options: any) {
  return (tree: Tree, _) => {
    const projectName = options?.project;
    const workspace = getWorkspace(tree);

    const project = workspace?.projects[projectName];
    if (!project) { throw Error(`expected project ${projectName} in angular.json`) }

    const architect = project.architect;
    if (!architect) { throw new Error(`expected project ${projectName} architect in angular.json`); }

    const test = architect.test;
    if (!test) { throw new Error(`expected project ${projectName} architect test in angular.json`); }

    // Custom Builders are not part of the CLI's enum
    test.builder = 'ngx-thunder:karma' as any;

    return updateWorkspace(workspace);
  };
}
